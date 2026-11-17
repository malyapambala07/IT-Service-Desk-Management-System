
package com.itservicedesk.backend.controller;

import com.itservicedesk.backend.dto.SystemSettingsRequest;
import com.itservicedesk.backend.entity.SystemSettings;
import com.itservicedesk.backend.service.SystemSettingsService;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
public class SystemSettingsController {

    private final SystemSettingsService settingsService;

    public SystemSettingsController(SystemSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public SystemSettings getSettings() {
        return settingsService.getSettings();
    }

    @PutMapping
    public SystemSettings updateSettings(
            @Valid @RequestBody SystemSettingsRequest request) {

        return settingsService.updateSettings(request);
    }
}
