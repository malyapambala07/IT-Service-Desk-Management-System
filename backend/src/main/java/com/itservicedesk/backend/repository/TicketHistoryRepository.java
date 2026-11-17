package com.itservicedesk.backend.repository;

import com.itservicedesk.backend.entity.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {

    List<TicketHistory> findByTicketIdOrderByChangedAtDesc(Long ticketId);

    List<TicketHistory> findByChangedById(Long userId);
}