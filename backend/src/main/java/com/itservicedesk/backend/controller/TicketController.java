
package com.itservicedesk.backend.controller;

import com.itservicedesk.backend.dto.TicketRequest;
import com.itservicedesk.backend.dto.TicketResponse;
import com.itservicedesk.backend.entity.TicketPriority;
import com.itservicedesk.backend.entity.TicketStatus;
import com.itservicedesk.backend.service.TicketService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<TicketResponse> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public TicketResponse getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @GetMapping("/number/{ticketNumber}")
    public TicketResponse getTicketByNumber(
            @PathVariable String ticketNumber) {

        return ticketService.getTicketByNumber(ticketNumber);
    }

    @GetMapping("/employee/{employeeId}")
    public List<TicketResponse> getTicketsByEmployee(
            @PathVariable Long employeeId) {

        return ticketService.getTicketsByEmployee(employeeId);
    }

    @GetMapping("/technician/{technicianId}")
    public List<TicketResponse> getTicketsByTechnician(
            @PathVariable Long technicianId) {

        return ticketService.getTicketsByTechnician(technicianId);
    }

    @GetMapping("/status/{status}")
    public List<TicketResponse> getTicketsByStatus(
            @PathVariable TicketStatus status) {

        return ticketService.getTicketsByStatus(status);
    }

    @GetMapping("/priority/{priority}")
    public List<TicketResponse> getTicketsByPriority(
            @PathVariable TicketPriority priority) {

        return ticketService.getTicketsByPriority(priority);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(
            @Valid @RequestBody TicketRequest request) {

        return ticketService.createTicket(request);
    }

    @PutMapping("/{ticketId}/assign/{technicianId}")
    public TicketResponse assignTicket(
            @PathVariable Long ticketId,
            @PathVariable Long technicianId) {

        return ticketService.assignTicket(ticketId, technicianId);
    }

    @PutMapping("/{id}")
    public TicketResponse updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest request) {

        return ticketService.updateTicket(id, request);
    }

    @PutMapping("/{id}/status")
    public TicketResponse updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {

        return ticketService.updateTicketStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
    }
}
