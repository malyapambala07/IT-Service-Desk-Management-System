
package com.itservicedesk.backend.dto;

import com.itservicedesk.backend.entity.TicketPriority;
import com.itservicedesk.backend.entity.TicketStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SystemSettingsRequest {

    @NotBlank
    private String applicationName;

    @NotBlank
    @Email
    private String supportEmail;

    @NotBlank
    @Size(max = 10)
    private String ticketPrefix;

    private boolean maintenanceMode;
    private boolean autoAssignTechnician;
    private boolean emailNotifications;
    private boolean ticketNotifications;
    private boolean slaNotifications;

    @NotNull
    private TicketPriority defaultPriority;

    @NotNull
    private TicketStatus defaultStatus;

    public String getApplicationName() { return applicationName; }
    public void setApplicationName(String applicationName) { this.applicationName = applicationName; }

    public String getSupportEmail() { return supportEmail; }
    public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }

    public String getTicketPrefix() { return ticketPrefix; }
    public void setTicketPrefix(String ticketPrefix) { this.ticketPrefix = ticketPrefix; }

    public boolean isMaintenanceMode() { return maintenanceMode; }
    public void setMaintenanceMode(boolean maintenanceMode) { this.maintenanceMode = maintenanceMode; }

    public boolean isAutoAssignTechnician() { return autoAssignTechnician; }
    public void setAutoAssignTechnician(boolean autoAssignTechnician) { this.autoAssignTechnician = autoAssignTechnician; }

    public boolean isEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public boolean isTicketNotifications() { return ticketNotifications; }
    public void setTicketNotifications(boolean ticketNotifications) { this.ticketNotifications = ticketNotifications; }

    public boolean isSlaNotifications() { return slaNotifications; }
    public void setSlaNotifications(boolean slaNotifications) { this.slaNotifications = slaNotifications; }

    public TicketPriority getDefaultPriority() { return defaultPriority; }
    public void setDefaultPriority(TicketPriority defaultPriority) { this.defaultPriority = defaultPriority; }

    public TicketStatus getDefaultStatus() { return defaultStatus; }
    public void setDefaultStatus(TicketStatus defaultStatus) { this.defaultStatus = defaultStatus; }
}
