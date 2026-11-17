
package com.itservicedesk.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sla_policies")
public class SLAPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private TicketPriority priority;

    @Column(nullable = false)
    private Integer responseTimeHours;

    @Column(nullable = false)
    private Integer resolutionTimeHours;

    private LocalDateTime createdAt;

    public SLAPolicy() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
