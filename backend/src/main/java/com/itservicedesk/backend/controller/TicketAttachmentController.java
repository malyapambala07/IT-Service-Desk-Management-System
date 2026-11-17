
package com.itservicedesk.backend.controller;

import com.itservicedesk.backend.dto.TicketAttachmentResponse;
import com.itservicedesk.backend.service.TicketAttachmentService;
import com.itservicedesk.backend.service.TicketAttachmentService.AttachmentDownload;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketAttachmentController {

    private final TicketAttachmentService attachmentService;

    public TicketAttachmentController(
            TicketAttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    // GET ATTACHMENTS BY TICKET
    @GetMapping("/ticket/{ticketId}")
    public List<TicketAttachmentResponse> getAttachmentsByTicket(
            @PathVariable Long ticketId) {

        return attachmentService.getAttachmentsByTicket(ticketId);
    }

    // GET ATTACHMENTS BY USER
    @GetMapping("/user/{userId}")
    public List<TicketAttachmentResponse> getAttachmentsByUser(
            @PathVariable Long userId) {

        return attachmentService.getAttachmentsByUser(userId);
    }

    // UPLOAD ACTUAL FILE
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public TicketAttachmentResponse uploadAttachment(
            @RequestParam Long ticketId,
            @RequestParam("file") MultipartFile file) {

        return attachmentService.uploadAttachment(file, ticketId);
    }

    // DOWNLOAD FILE
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long id) {

        AttachmentDownload download =
                attachmentService.downloadAttachment(id);

        ContentDisposition disposition =
                ContentDisposition.attachment()
                        .filename(
                                download.fileName(),
                                StandardCharsets.UTF_8)
                        .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(download.resource());
    }

    // DELETE ATTACHMENT
    @DeleteMapping("/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
    }
}
