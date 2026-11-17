package com.itservicedesk.backend.repository;

import com.itservicedesk.backend.entity.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

    List<TicketAttachment> findByTicketId(Long ticketId);

    List<TicketAttachment> findByUploadedById(Long userId);
}