
package com.itservicedesk.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String applicationName;
    private String supportEmail;
    private String ticketPrefix;

    private boolean maintenanceMode;
    private boolean autoAssignTechnician = false;
    private boolean emailNotifications = true;
    private boolean ticketNotifications = true;
    private boolean slaNotifications = true;

    @Enumerated(EnumType.STRING)
    private TicketPriority defaultPriority = TicketPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    private TicketStatus defaultStatus = TicketStatus.OPEN;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
