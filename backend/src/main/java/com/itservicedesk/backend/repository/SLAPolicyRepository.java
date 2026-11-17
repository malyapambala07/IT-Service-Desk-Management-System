package com.itservicedesk.backend.repository;

import com.itservicedesk.backend.entity.SLAPolicy;
import com.itservicedesk.backend.entity.TicketPriority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SLAPolicyRepository extends JpaRepository<SLAPolicy, Long> {

    Optional<SLAPolicy> findByPriority(TicketPriority priority);

    boolean existsByPriority(TicketPriority priority);
}