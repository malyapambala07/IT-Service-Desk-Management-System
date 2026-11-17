
package com.itservicedesk.backend.controller;

import com.itservicedesk.backend.dto.ReportsResponse;
import com.itservicedesk.backend.service.ReportsService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping
    public ReportsResponse getReports() {
        return reportsService.getReports();
    }
}
