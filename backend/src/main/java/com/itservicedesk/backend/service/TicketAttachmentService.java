
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.DtoMapper;
import com.itservicedesk.backend.dto.TicketAttachmentResponse;
import com.itservicedesk.backend.entity.Role;
import com.itservicedesk.backend.entity.Ticket;
import com.itservicedesk.backend.entity.TicketAttachment;
import com.itservicedesk.backend.entity.User;
import com.itservicedesk.backend.repository.TicketAttachmentRepository;
import com.itservicedesk.backend.repository.TicketRepository;
import com.itservicedesk.backend.repository.UserRepository;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@Transactional
public class TicketAttachmentService {

    private final TicketAttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public TicketAttachmentService(
            TicketAttachmentRepository attachmentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService) {

        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    // GET ATTACHMENTS BY TICKET
    @Transactional(readOnly = true)
    public List<TicketAttachmentResponse> getAttachmentsByTicket(
            Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found"));

        User currentUser = getCurrentUser();
        checkTicketAccess(ticket, currentUser);

        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(DtoMapper::toAttachmentResponse)
                .toList();
    }

    // GET ATTACHMENTS BY USER
    @Transactional(readOnly = true)
    public List<TicketAttachmentResponse> getAttachmentsByUser(
            Long userId) {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !currentUser.getId().equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot view another user's attachments");
        }

        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "User not found");
        }

        return attachmentRepository.findByUploadedById(userId)
                .stream()
                .filter(attachment ->
                        hasTicketAccess(attachment.getTicket(), currentUser))
                .map(DtoMapper::toAttachmentResponse)
                .toList();
    }

    // UPLOAD ACTUAL FILE
    public TicketAttachmentResponse uploadAttachment(
            MultipartFile file, Long ticketId) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a file");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found"));

        User currentUser = getCurrentUser();

        checkTicketAccess(ticket, currentUser);

        String storedName;

        try {
            storedName = fileStorageService.store(file);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store uploaded file");
        }

        TicketAttachment attachment = new TicketAttachment();

        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(
                file.getContentType() != null
                        ? file.getContentType()
                        : "application/octet-stream");
        attachment.setFileSize(file.getSize());
        attachment.setFilePath(storedName);
        attachment.setTicket(ticket);
        attachment.setUploadedBy(currentUser);

        try {
            TicketAttachment saved =
                    attachmentRepository.save(attachment);

            return DtoMapper.toAttachmentResponse(saved);

        } catch (RuntimeException exception) {

            try {
                fileStorageService.delete(storedName);
            } catch (IOException ignored) {
                // Preserve the original database exception.
            }

            throw exception;
        }
    }

    // DOWNLOAD ATTACHMENT
    @Transactional(readOnly = true)
    public AttachmentDownload downloadAttachment(Long id) {

        TicketAttachment attachment =
                attachmentRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Attachment not found"));

        User currentUser = getCurrentUser();

        checkTicketAccess(attachment.getTicket(), currentUser);

        try {
            Resource resource =
                    fileStorageService.load(attachment.getFilePath());

            return new AttachmentDownload(
                    resource, attachment.getFileName());

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to retrieve attachment");
        }
    }

    // DELETE ATTACHMENT
    public void deleteAttachment(Long id) {

        TicketAttachment attachment =
                attachmentRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Attachment not found"));

        User currentUser = getCurrentUser();

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        boolean isUploader =
                attachment.getUploadedBy().getId()
                        .equals(currentUser.getId());

        if (!isAdmin && !isUploader) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only delete your own attachments");
        }

        try {
            fileStorageService.delete(attachment.getFilePath());
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to delete attachment file");
        }

        attachmentRepository.delete(attachment);
    }

    // GET LOGGED-IN USER
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in first");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    // CHECK TICKET ACCESS
    private void checkTicketAccess(Ticket ticket, User user) {

        if (!hasTicketAccess(ticket, user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this ticket");
        }
    }

    private boolean hasTicketAccess(Ticket ticket, User user) {

        boolean isAdmin = user.getRole() == Role.ADMIN;

        boolean isEmployee =
                ticket.getEmployee().getId().equals(user.getId());

        boolean isAssignedTechnician =
                ticket.getTechnician() != null
                && ticket.getTechnician().getId().equals(user.getId());

        return isAdmin || isEmployee || isAssignedTechnician;
    }

    public record AttachmentDownload(
            Resource resource,
            String fileName) {
    }
}
