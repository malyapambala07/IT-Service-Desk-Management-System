
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.DtoMapper;
import com.itservicedesk.backend.dto.TicketHistoryResponse;
import com.itservicedesk.backend.entity.Role;
import com.itservicedesk.backend.entity.Ticket;
import com.itservicedesk.backend.entity.TicketHistory;
import com.itservicedesk.backend.entity.User;
import com.itservicedesk.backend.repository.TicketHistoryRepository;
import com.itservicedesk.backend.repository.TicketRepository;
import com.itservicedesk.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TicketHistoryService {

    private final TicketHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketHistoryService(
            TicketHistoryRepository historyRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository) {

        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // GET HISTORY BY TICKET
    @Transactional(readOnly = true)
    public List<TicketHistoryResponse> getHistoryByTicket(Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        User currentUser = getCurrentUser();

        checkTicketAccess(ticket, currentUser);

        return historyRepository
                .findByTicketIdOrderByChangedAtDesc(ticketId)
                .stream()
                .map(DtoMapper::toHistoryResponse)
                .toList();
    }

    // GET HISTORY BY USER
    @Transactional(readOnly = true)
    public List<TicketHistoryResponse> getHistoryByUser(Long userId) {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !currentUser.getId().equals(userId)) {

            throw new RuntimeException(
                    "You are not allowed to view this user's history");
        }

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        return historyRepository.findByChangedById(userId)
                .stream()
                .map(DtoMapper::toHistoryResponse)
                .toList();
    }

    // INTERNAL BACKEND METHOD TO RECORD HISTORY
    public void recordHistory(
            Ticket ticket,
            User changedBy,
            String action,
            String oldValue,
            String newValue) {

        if (ticket == null || changedBy == null
                || action == null || action.isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid ticket history details");
        }

        TicketHistory history = new TicketHistory();

        history.setTicket(ticket);
        history.setChangedBy(changedBy);
        history.setAction(action);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);

        historyRepository.save(history);
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

    // CHECK WHETHER USER CAN ACCESS THIS TICKET
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
                    "You are not allowed to view this ticket history");
        }
    }
}
