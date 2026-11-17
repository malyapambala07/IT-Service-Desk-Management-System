
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.SystemSettingsRequest;
import com.itservicedesk.backend.entity.SystemSettings;
import com.itservicedesk.backend.entity.TicketPriority;
import com.itservicedesk.backend.entity.TicketStatus;
import com.itservicedesk.backend.repository.SystemSettingsRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SystemSettingsService {

    private final SystemSettingsRepository repository;

    public SystemSettingsService(SystemSettingsRepository repository) {
        this.repository = repository;
    }

    public SystemSettings getSettings() {
        return repository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);
    }

    public SystemSettings updateSettings(SystemSettingsRequest request) {

        if (request == null
                || request.getApplicationName() == null
                || request.getApplicationName().isBlank()
                || request.getSupportEmail() == null
                || request.getSupportEmail().isBlank()
                || request.getTicketPrefix() == null
                || request.getTicketPrefix().isBlank()
                || request.getDefaultPriority() == null
                || request.getDefaultStatus() == null) {

            throw new IllegalArgumentException(
                    "Valid system settings are required");
        }

        SystemSettings settings = getSettings();

        settings.setApplicationName(request.getApplicationName().trim());
        settings.setSupportEmail(request.getSupportEmail().trim());
        settings.setTicketPrefix(request.getTicketPrefix().trim());

        settings.setMaintenanceMode(request.isMaintenanceMode());
        settings.setAutoAssignTechnician(request.isAutoAssignTechnician());

        settings.setEmailNotifications(request.isEmailNotifications());
        settings.setTicketNotifications(request.isTicketNotifications());
        settings.setSlaNotifications(request.isSlaNotifications());

        settings.setDefaultPriority(request.getDefaultPriority());
        settings.setDefaultStatus(request.getDefaultStatus());

        return repository.save(settings);
    }

    private SystemSettings createDefaultSettings() {

        SystemSettings settings = new SystemSettings();

        settings.setApplicationName("IT Service Desk");
        settings.setSupportEmail("support@servicedesk.com");
        settings.setTicketPrefix("TKT");

        settings.setDefaultPriority(TicketPriority.MEDIUM);
        settings.setDefaultStatus(TicketStatus.OPEN);

        return repository.save(settings);
    }
}
