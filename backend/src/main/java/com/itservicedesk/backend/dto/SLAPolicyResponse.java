
package com.itservicedesk.backend.dto;

import com.itservicedesk.backend.entity.TicketPriority;
import java.time.LocalDateTime;

public class SLAPolicyResponse {

    private Long id;
    private TicketPriority priority;
    private int responseTimeHours;
    private int resolutionTimeHours;
    private LocalDateTime createdAt;

    public SLAPolicyResponse() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public int getResponseTimeHours() { return responseTimeHours; }
    public void setResponseTimeHours(int responseTimeHours) { this.responseTimeHours = responseTimeHours; }

    public int getResolutionTimeHours() { return resolutionTimeHours; }
    public void setResolutionTimeHours(int resolutionTimeHours) { this.resolutionTimeHours = resolutionTimeHours; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
