
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.DashboardResponse;
import com.itservicedesk.backend.entity.Ticket;
import com.itservicedesk.backend.entity.TicketStatus;
import com.itservicedesk.backend.entity.TicketPriority;
import com.itservicedesk.backend.entity.User;
import com.itservicedesk.backend.entity.Role;
import com.itservicedesk.backend.repository.TicketRepository;
import com.itservicedesk.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public DashboardService(
            TicketRepository ticketRepository,
            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public DashboardResponse getDashboardData() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String email = authentication.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new AccessDeniedException("User not found"));

        List<Ticket> tickets;

        if (currentUser.getRole() == Role.ADMIN) {
            tickets = ticketRepository.findAll();
        } else if (currentUser.getRole() == Role.EMPLOYEE) {
            tickets = ticketRepository.findByEmployeeId(currentUser.getId());
        } else if (currentUser.getRole() == Role.TECHNICIAN) {
            tickets = ticketRepository.findByTechnicianId(currentUser.getId());
        } else {
            throw new AccessDeniedException("Invalid user role");
        }

        DashboardResponse response = new DashboardResponse();

        response.setTotalTickets(tickets.size());

        response.setOpenTickets(
                countByStatus(tickets, TicketStatus.OPEN));

        response.setAssignedTickets(
                countByStatus(tickets, TicketStatus.ASSIGNED));

        response.setInProgressTickets(
                countByStatus(tickets, TicketStatus.IN_PROGRESS));

        response.setResolvedTickets(
                countByStatus(tickets, TicketStatus.RESOLVED));

        response.setClosedTickets(
                countByStatus(tickets, TicketStatus.CLOSED));

        response.setCriticalTickets(
                tickets.stream()
                        .filter(ticket ->
                                ticket.getPriority() == TicketPriority.CRITICAL)
                        .count()
        );

        Map<String, Long> statusCounts = tickets.stream()
                .collect(Collectors.groupingBy(
                        ticket -> ticket.getStatus().name(),
                        Collectors.counting()
                ));

        Map<String, Long> priorityCounts = tickets.stream()
                .collect(Collectors.groupingBy(
                        ticket -> ticket.getPriority().name(),
                        Collectors.counting()
                ));

        response.setStatusCounts(statusCounts);
        response.setPriorityCounts(priorityCounts);

        return response;
    }

    private long countByStatus(
            List<Ticket> tickets,
            TicketStatus status) {

        return tickets.stream()
                .filter(ticket -> ticket.getStatus() == status)
                .count();
    }
}
