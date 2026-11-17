
package com.itservicedesk.backend.controller;

import com.itservicedesk.backend.dto.TicketHistoryResponse;
import com.itservicedesk.backend.service.TicketHistoryService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket-history")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketHistoryController {

    private final TicketHistoryService historyService;

    public TicketHistoryController(
            TicketHistoryService historyService) {
        this.historyService = historyService;
    }

    // GET HISTORY BY TICKET
    @GetMapping("/ticket/{ticketId}")
    public List<TicketHistoryResponse> getHistoryByTicket(
            @PathVariable Long ticketId) {

        return historyService.getHistoryByTicket(ticketId);
    }

    // GET HISTORY BY USER
    @GetMapping("/user/{userId}")
    public List<TicketHistoryResponse> getHistoryByUser(
            @PathVariable Long userId) {

        return historyService.getHistoryByUser(userId);
    }
}
