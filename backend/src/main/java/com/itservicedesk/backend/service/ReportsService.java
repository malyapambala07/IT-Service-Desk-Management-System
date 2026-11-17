
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.ReportsResponse;
import com.itservicedesk.backend.entity.Ticket;
import com.itservicedesk.backend.entity.TicketStatus;
import com.itservicedesk.backend.repository.TicketRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportsService {

    private final TicketRepository ticketRepository;

    public ReportsService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public ReportsResponse getReports() {

        List<Ticket> tickets = ticketRepository.findAll();

        ReportsResponse response = new ReportsResponse();

        response.setTotalTickets(tickets.size());

        response.setResolvedTickets(
                tickets.stream()
                        .filter(ticket ->
                                ticket.getStatus() == TicketStatus.RESOLVED
                                || ticket.getStatus() == TicketStatus.CLOSED)
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

        Map<String, Long> monthlyCounts = tickets.stream()
                .filter(ticket -> ticket.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        ticket -> YearMonth.from(ticket.getCreatedAt())
                                .format(DateTimeFormatter.ofPattern("MMM yyyy")),
                        Collectors.counting()
                ));

        Map<String, Long> technicianCounts = tickets.stream()
                .collect(Collectors.groupingBy(
                        ticket -> ticket.getTechnician() == null
                                ? "Unassigned"
                                : ticket.getTechnician().getFullName(),
                        Collectors.counting()
                ));

        response.setStatusCounts(statusCounts);
        response.setPriorityCounts(priorityCounts);
        response.setMonthlyTicketCounts(monthlyCounts);
        response.setTechnicianTicketCounts(technicianCounts);

        return response;
    }
}
