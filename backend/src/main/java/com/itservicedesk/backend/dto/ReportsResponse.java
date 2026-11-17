
package com.itservicedesk.backend.dto;

import java.util.Map;

public class ReportsResponse {

    private long totalTickets;
    private long resolvedTickets;

    private Map<String, Long> statusCounts;
    private Map<String, Long> priorityCounts;
    private Map<String, Long> monthlyTicketCounts;
    private Map<String, Long> technicianTicketCounts;

    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public long getResolvedTickets() {
        return resolvedTickets;
    }

    public void setResolvedTickets(long resolvedTickets) {
        this.resolvedTickets = resolvedTickets;
    }

    public Map<String, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public Map<String, Long> getPriorityCounts() {
        return priorityCounts;
    }

    public void setPriorityCounts(Map<String, Long> priorityCounts) {
        this.priorityCounts = priorityCounts;
    }

    public Map<String, Long> getMonthlyTicketCounts() {
        return monthlyTicketCounts;
    }

    public void setMonthlyTicketCounts(Map<String, Long> monthlyTicketCounts) {
        this.monthlyTicketCounts = monthlyTicketCounts;
    }

    public Map<String, Long> getTechnicianTicketCounts() {
        return technicianTicketCounts;
    }

    public void setTechnicianTicketCounts(Map<String, Long> technicianTicketCounts) {
        this.technicianTicketCounts = technicianTicketCounts;
    }
}
