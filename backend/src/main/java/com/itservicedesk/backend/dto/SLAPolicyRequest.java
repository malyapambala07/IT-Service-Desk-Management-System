
package com.itservicedesk.backend.dto;

import com.itservicedesk.backend.entity.TicketPriority;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class SLAPolicyRequest {

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotNull(message = "Response time is required")
    @Positive(message = "Response time must be positive")
    private Integer responseTimeHours;

    @NotNull(message = "Resolution time is required")
    @Positive(message = "Resolution time must be positive")
    private Integer resolutionTimeHours;

    public SLAPolicyRequest() {
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public Integer getResponseTimeHours() {
        return responseTimeHours;
    }

    public void setResponseTimeHours(Integer responseTimeHours) {
        this.responseTimeHours = responseTimeHours;
    }

    public Integer getResolutionTimeHours() {
        return resolutionTimeHours;
    }

    public void setResolutionTimeHours(Integer resolutionTimeHours) {
        this.resolutionTimeHours = resolutionTimeHours;
    }
}
