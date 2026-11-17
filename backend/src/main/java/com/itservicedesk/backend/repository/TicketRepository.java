package com.itservicedesk.backend.repository;

import com.itservicedesk.backend.entity.Ticket;
import com.itservicedesk.backend.entity.TicketStatus;
import com.itservicedesk.backend.entity.TicketPriority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    boolean existsByTicketNumber(String ticketNumber);

    List<Ticket> findByEmployeeId(Long employeeId);

    List<Ticket> findByTechnicianId(Long technicianId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByEmployeeIdAndStatus(Long employeeId, TicketStatus status);

    List<Ticket> findByTechnicianIdAndStatus(Long technicianId, TicketStatus status);
}