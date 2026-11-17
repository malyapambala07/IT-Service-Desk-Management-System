
package com.itservicedesk.backend.controller;

import com.itservicedesk.backend.dto.SLAPolicyRequest;
import com.itservicedesk.backend.dto.SLAPolicyResponse;
import com.itservicedesk.backend.entity.TicketPriority;
import com.itservicedesk.backend.service.SLAPolicyService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sla")
@CrossOrigin(origins = "http://localhost:5173")
public class SLAPolicyController {

    private final SLAPolicyService slaPolicyService;

    public SLAPolicyController(SLAPolicyService slaPolicyService) {
        this.slaPolicyService = slaPolicyService;
    }

    @GetMapping
    public List<SLAPolicyResponse> getAllPolicies() {
        return slaPolicyService.getAllPolicies();
    }

    @GetMapping("/{priority}")
    public SLAPolicyResponse getPolicyByPriority(
            @PathVariable TicketPriority priority) {

        return slaPolicyService.getPolicyByPriority(priority);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public SLAPolicyResponse createPolicy(
            @Valid @RequestBody SLAPolicyRequest request) {

        return slaPolicyService.savePolicy(request);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SLAPolicyResponse updatePolicy(
            @Valid @RequestBody SLAPolicyRequest request) {

        return slaPolicyService.savePolicy(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePolicy(@PathVariable Long id) {
        slaPolicyService.deletePolicy(id);
    }
}
