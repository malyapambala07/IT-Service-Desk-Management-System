
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.DtoMapper;
import com.itservicedesk.backend.dto.TicketRequest;
import com.itservicedesk.backend.dto.TicketResponse;
import com.itservicedesk.backend.entity.*;
import com.itservicedesk.backend.repository.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SLAPolicyRepository slaPolicyRepository;
    private final TicketHistoryService historyService;
    private final NotificationService notificationService;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            SLAPolicyRepository slaPolicyRepository,
            TicketHistoryService historyService,
            NotificationService notificationService) {

        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.slaPolicyRepository = slaPolicyRepository;
        this.historyService = historyService;
        this.notificationService = notificationService;
    }

    // GET ALL TICKETS ACCORDING TO USER ROLE
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {

        User currentUser = getCurrentUser();

        List<Ticket> tickets;

        if (currentUser.getRole() == Role.ADMIN) {
            tickets = ticketRepository.findAll();
        } else if (currentUser.getRole() == Role.EMPLOYEE) {
            tickets = ticketRepository.findByEmployeeId(currentUser.getId());
        } else {
            tickets = ticketRepository.findByTechnicianId(currentUser.getId());
        }

        return tickets.stream()
                .map(DtoMapper::toTicketResponse)
                .toList();
    }

    // GET TICKET BY ID
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {

        Ticket ticket = findTicket(id);
        checkTicketAccess(ticket, getCurrentUser());

        return DtoMapper.toTicketResponse(ticket);
    }

    // GET TICKET BY NUMBER
    @Transactional(readOnly = true)
    public TicketResponse getTicketByNumber(String ticketNumber) {

        Ticket ticket = ticketRepository
                .findByTicketNumber(ticketNumber)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        checkTicketAccess(ticket, getCurrentUser());

        return DtoMapper.toTicketResponse(ticket);
    }

    // GET TICKETS BY EMPLOYEE
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByEmployee(Long employeeId) {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !currentUser.getId().equals(employeeId)) {

            throw new RuntimeException(
                    "You are not allowed to view these tickets");
        }

        return ticketRepository.findByEmployeeId(employeeId)
                .stream()
                .map(DtoMapper::toTicketResponse)
                .toList();
    }

    // GET TICKETS BY TECHNICIAN
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByTechnician(Long technicianId) {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !(currentUser.getRole() == Role.TECHNICIAN
                && currentUser.getId().equals(technicianId))) {

            throw new RuntimeException(
                    "You are not allowed to view these tickets");
        }

        return ticketRepository.findByTechnicianId(technicianId)
                .stream()
                .map(DtoMapper::toTicketResponse)
                .toList();
    }

    // GET TICKETS BY STATUS - ADMIN ONLY
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByStatus(TicketStatus status) {

        requireAdmin();

        if (status == null) {
            throw new IllegalArgumentException("Ticket status is required");
        }

        return ticketRepository.findByStatus(status)
                .stream()
                .map(DtoMapper::toTicketResponse)
                .toList();
    }

    // GET TICKETS BY PRIORITY - ADMIN ONLY
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByPriority(TicketPriority priority) {

        requireAdmin();

        if (priority == null) {
            throw new IllegalArgumentException("Ticket priority is required");
        }

        return ticketRepository.findByPriority(priority)
                .stream()
                .map(DtoMapper::toTicketResponse)
                .toList();
    }

    // CREATE TICKET
    public TicketResponse createTicket(TicketRequest request) {

        if (request == null
                || request.getSubject() == null
                || request.getSubject().isBlank()
                || request.getDescription() == null
                || request.getDescription().isBlank()
                || request.getCategory() == null
                || request.getCategory().isBlank()) {

            throw new IllegalArgumentException("Invalid ticket details");
        }

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.EMPLOYEE) {
            throw new RuntimeException(
                    "Only employees can create tickets");
        }

        Ticket ticket = DtoMapper.toTicket(request);

        ticket.setEmployee(currentUser);
        ticket.setTechnician(null);
        ticket.setTicketNumber(generateTicketNumber());

        if (ticket.getPriority() == null) {
            ticket.setPriority(TicketPriority.MEDIUM);
        }

        ticket.setStatus(TicketStatus.OPEN);

        updateSlaDeadline(ticket);

        Ticket savedTicket = ticketRepository.save(ticket);

        historyService.recordHistory(
                savedTicket,
                currentUser,
                "TICKET_CREATED",
                null,
                "Ticket created with priority " + savedTicket.getPriority()
        );

        // Notify all administrators about the new ticket.
        List<User> administrators = userRepository.findByRole(Role.ADMIN);

        for (User admin : administrators) {
            if (!admin.getId().equals(currentUser.getId())) {
                notificationService.createNotification(
                        admin.getId(),
                        savedTicket.getId(),
                        "New Ticket Created",
                        "A new ticket " + savedTicket.getTicketNumber()
                                + " has been created.",
                        "TICKET_CREATED"
                );
            }
        }

        return DtoMapper.toTicketResponse(savedTicket);
    }

    // ASSIGN TICKET - ADMIN ONLY
    public TicketResponse assignTicket(
            Long ticketId,
            Long technicianId) {

        requireAdmin();

        if (technicianId == null) {
            throw new IllegalArgumentException(
                    "Technician ID is required");
        }

        User currentUser = getCurrentUser();
        Ticket ticket = findTicket(ticketId);

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() ->
                        new RuntimeException("Technician not found"));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new RuntimeException(
                    "Selected user is not a technician");
        }

        String oldTechnician = ticket.getTechnician() == null
                ? "Unassigned"
                : ticket.getTechnician().getFullName();

        String oldStatus = ticket.getStatus().name();

        ticket.setTechnician(technician);
        ticket.setStatus(TicketStatus.ASSIGNED);

        Ticket savedTicket = ticketRepository.save(ticket);

        historyService.recordHistory(
                savedTicket,
                currentUser,
                "TICKET_ASSIGNED",
                oldTechnician,
                technician.getFullName()
        );

        if (!oldStatus.equals(TicketStatus.ASSIGNED.name())) {
            historyService.recordHistory(
                    savedTicket,
                    currentUser,
                    "STATUS_CHANGED",
                    oldStatus,
                    TicketStatus.ASSIGNED.name()
            );
        }

        // Notify the employee and newly assigned technician.
        notifyTicketParticipants(
                savedTicket,
                currentUser,
                "Ticket Assigned",
                "Ticket " + savedTicket.getTicketNumber()
                        + " has been assigned to "
                        + technician.getFullName() + ".",
                "TICKET_ASSIGNED"
        );

        return DtoMapper.toTicketResponse(savedTicket);
    }

    // UPDATE TICKET DETAILS
    public TicketResponse updateTicket(
            Long id,
            TicketRequest request) {

        if (request == null
                || request.getSubject() == null
                || request.getSubject().isBlank()
                || request.getDescription() == null
                || request.getDescription().isBlank()
                || request.getCategory() == null
                || request.getCategory().isBlank()) {

            throw new IllegalArgumentException("Invalid ticket details");
        }

        User currentUser = getCurrentUser();
        Ticket ticket = findTicket(id);

        checkTicketAccess(ticket, currentUser);

        if (currentUser.getRole() == Role.TECHNICIAN) {
            throw new RuntimeException(
                    "Technicians cannot edit ticket details");
        }

        recordFieldChange(
                ticket, currentUser, "SUBJECT_CHANGED",
                ticket.getSubject(), request.getSubject());

        recordFieldChange(
                ticket, currentUser, "DESCRIPTION_CHANGED",
                ticket.getDescription(), request.getDescription());

        recordFieldChange(
                ticket, currentUser, "CATEGORY_CHANGED",
                ticket.getCategory(), request.getCategory());

        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());

        boolean priorityChanged = false;

        if (request.getPriority() != null
                && request.getPriority() != ticket.getPriority()) {

            TicketPriority oldPriority = ticket.getPriority();

            ticket.setPriority(request.getPriority());
            updateSlaDeadline(ticket);
            priorityChanged = true;

            historyService.recordHistory(
                    ticket,
                    currentUser,
                    "PRIORITY_CHANGED",
                    oldPriority == null ? null : oldPriority.name(),
                    request.getPriority().name()
            );
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        if (priorityChanged) {
            notifyTicketParticipants(
                    savedTicket,
                    currentUser,
                    "Ticket Priority Updated",
                    "The priority of ticket "
                            + savedTicket.getTicketNumber()
                            + " has been changed to "
                            + savedTicket.getPriority() + ".",
                    "PRIORITY_CHANGED"
            );
        }

        return DtoMapper.toTicketResponse(savedTicket);
    }

    // UPDATE TICKET STATUS
    public TicketResponse updateTicketStatus(
            Long id,
            TicketStatus status) {

        if (status == null) {
            throw new IllegalArgumentException(
                    "Ticket status is required");
        }

        User currentUser = getCurrentUser();
        Ticket ticket = findTicket(id);

        checkTicketAccess(ticket, currentUser);

        if (currentUser.getRole() != Role.ADMIN
                && currentUser.getRole() != Role.TECHNICIAN) {

            throw new RuntimeException(
                    "Only admins and technicians can update ticket status");
        }

        if (currentUser.getRole() == Role.TECHNICIAN
                && (ticket.getTechnician() == null
                || !ticket.getTechnician().getId().equals(currentUser.getId()))) {

            throw new RuntimeException(
                    "You can only update tickets assigned to you");
        }

        TicketStatus oldStatus = ticket.getStatus();

        if (oldStatus != status) {

            ticket.setStatus(status);

            if (status == TicketStatus.RESOLVED
                    || status == TicketStatus.CLOSED) {

                ticket.setResolvedAt(LocalDateTime.now());

            } else {
                ticket.setResolvedAt(null);
            }

            historyService.recordHistory(
                    ticket,
                    currentUser,
                    "STATUS_CHANGED",
                    oldStatus == null ? null : oldStatus.name(),
                    status.name()
            );
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        if (oldStatus != status) {
            notifyTicketParticipants(
                    savedTicket,
                    currentUser,
                    "Ticket Status Updated",
                    "The status of ticket "
                            + savedTicket.getTicketNumber()
                            + " has changed to " + status + ".",
                    "STATUS_CHANGED"
            );
        }

        return DtoMapper.toTicketResponse(savedTicket);
    }

    // DELETE TICKET - ADMIN ONLY
    public void deleteTicket(Long id) {

        requireAdmin();

        Ticket ticket = findTicket(id);
        ticketRepository.delete(ticket);
    }

    // NOTIFY EMPLOYEE AND TECHNICIAN, EXCLUDING THE PERSON WHO PERFORMED THE ACTION
    private void notifyTicketParticipants(
            Ticket ticket,
            User actor,
            String title,
            String message,
            String type) {

        Long actorId = actor.getId();

        User employee = ticket.getEmployee();
        User technician = ticket.getTechnician();

        if (employee != null
                && !employee.getId().equals(actorId)) {

            notificationService.createNotification(
                    employee.getId(),
                    ticket.getId(),
                    title,
                    message,
                    type
            );
        }

        if (technician != null
                && !technician.getId().equals(actorId)
                && (employee == null
                || !technician.getId().equals(employee.getId()))) {

            notificationService.createNotification(
                    technician.getId(),
                    ticket.getId(),
                    title,
                    message,
                    type
            );
        }
    }

    // RECORD FIELD CHANGE ONLY WHEN VALUE CHANGES
    private void recordFieldChange(
            Ticket ticket,
            User currentUser,
            String action,
            String oldValue,
            String newValue) {

        if (oldValue != null && !oldValue.equals(newValue)) {

            historyService.recordHistory(
                    ticket,
                    currentUser,
                    action,
                    oldValue,
                    newValue
            );
        }
    }

    // FIND TICKET
    private Ticket findTicket(Long id) {

        if (id == null) {
            throw new IllegalArgumentException("Ticket ID is required");
        }

        return ticketRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));
    }

    // GET LOGGED-IN USER
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException("User is not authenticated");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Logged-in user not found"));
    }

    // CHECK TICKET ACCESS
    private void checkTicketAccess(Ticket ticket, User user) {

        if (user.getRole() == Role.ADMIN) {
            return;
        }

        boolean isEmployee =
                ticket.getEmployee() != null
                && ticket.getEmployee().getId().equals(user.getId());

        boolean isAssignedTechnician =
                ticket.getTechnician() != null
                && ticket.getTechnician().getId().equals(user.getId());

        if (!isEmployee && !isAssignedTechnician) {
            throw new RuntimeException(
                    "You are not allowed to access this ticket");
        }
    }

    // ADMIN-ONLY OPERATION
    private void requireAdmin() {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException(
                    "Only administrators can perform this operation");
        }
    }

    // UPDATE SLA DEADLINE
    private void updateSlaDeadline(Ticket ticket) {

        ticket.setSlaDeadline(null);

        slaPolicyRepository.findByPriority(ticket.getPriority())
                .ifPresent(policy ->
                        ticket.setSlaDeadline(
                                LocalDateTime.now().plusHours(
                                        policy.getResolutionTimeHours()
                                )
                        )
                );
    }

    // GENERATE UNIQUE TICKET NUMBER
    private String generateTicketNumber() {

        String ticketNumber;

        do {
            ticketNumber = "TKT-" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();

        } while (ticketRepository.existsByTicketNumber(ticketNumber));

        return ticketNumber;
    }
}
