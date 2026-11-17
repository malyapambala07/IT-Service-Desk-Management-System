
package com.itservicedesk.backend.dto;

import com.itservicedesk.backend.entity.*;

public class DtoMapper {

    private DtoMapper() {
    }

    // USER MAPPING

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
public static User toUser(UserRequest request) {
    User user = new User();

    user.setFullName(request.getFullName());
    user.setEmail(request.getEmail());
    user.setRole(request.getRole());

    return user;
}
    // TICKET MAPPING

    public static TicketResponse toTicketResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();

        response.setId(ticket.getId());
        response.setTicketNumber(ticket.getTicketNumber());
        response.setSubject(ticket.getSubject());
        response.setDescription(ticket.getDescription());
        response.setCategory(ticket.getCategory());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());

        if (ticket.getEmployee() != null) {
            response.setEmployeeId(ticket.getEmployee().getId());
            response.setEmployeeName(ticket.getEmployee().getFullName());
        }

        if (ticket.getTechnician() != null) {
            response.setTechnicianId(ticket.getTechnician().getId());
            response.setTechnicianName(ticket.getTechnician().getFullName());
        }

        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setSlaDeadline(ticket.getSlaDeadline());

        return response;
    }

    public static Ticket toTicket(TicketRequest request) {
        Ticket ticket = new Ticket();

        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());

        return ticket;
    }

    // TICKET COMMENT MAPPING

    public static TicketCommentResponse toCommentResponse(
            TicketComment comment) {

        TicketCommentResponse response =
                new TicketCommentResponse();

        response.setId(comment.getId());
        response.setMessage(comment.getMessage());

        if (comment.getTicket() != null) {
            response.setTicketId(comment.getTicket().getId());
        }

        if (comment.getUser() != null) {
            response.setUserId(comment.getUser().getId());
            response.setUserName(comment.getUser().getFullName());
        }

        response.setCreatedAt(comment.getCreatedAt());

        return response;
    }

    // TICKET ATTACHMENT MAPPING

    public static TicketAttachmentResponse toAttachmentResponse(
            TicketAttachment attachment) {

        TicketAttachmentResponse response =
                new TicketAttachmentResponse();

        response.setId(attachment.getId());
        response.setFileName(attachment.getFileName());
        response.setFileType(attachment.getFileType());
        response.setFileSize(attachment.getFileSize());

        if (attachment.getTicket() != null) {
            response.setTicketId(attachment.getTicket().getId());
        }

        if (attachment.getUploadedBy() != null) {
            response.setUploadedById(
                    attachment.getUploadedBy().getId());

            response.setUploadedByName(
                    attachment.getUploadedBy().getFullName());
        }

        response.setUploadedAt(attachment.getUploadedAt());

        return response;
    }

    // TICKET HISTORY MAPPING

    public static TicketHistoryResponse toHistoryResponse(
            TicketHistory history) {

        TicketHistoryResponse response =
                new TicketHistoryResponse();

        response.setId(history.getId());
        response.setAction(history.getAction());
        response.setOldValue(history.getOldValue());
        response.setNewValue(history.getNewValue());

        if (history.getTicket() != null) {
            response.setTicketId(history.getTicket().getId());
        }

        if (history.getChangedBy() != null) {
            response.setChangedById(
                    history.getChangedBy().getId());

            response.setChangedByName(
                    history.getChangedBy().getFullName());
        }

        response.setChangedAt(history.getChangedAt());

        return response;
    }

    // SLA POLICY MAPPING

    public static SLAPolicyResponse toSLAPolicyResponse(
            SLAPolicy policy) {

        SLAPolicyResponse response =
                new SLAPolicyResponse();

        response.setId(policy.getId());
        response.setPriority(policy.getPriority());
        response.setResponseTimeHours(
                policy.getResponseTimeHours());

        response.setResolutionTimeHours(
                policy.getResolutionTimeHours());

        response.setCreatedAt(policy.getCreatedAt());

        return response;
    }

    public static SLAPolicy toSLAPolicy(SLAPolicyRequest request) {
        SLAPolicy policy = new SLAPolicy();

        policy.setPriority(request.getPriority());
        policy.setResponseTimeHours(
                request.getResponseTimeHours());

        policy.setResolutionTimeHours(
                request.getResolutionTimeHours());

        return policy;
    }

    // NOTIFICATION MAPPING

    public static NotificationResponse toNotificationResponse(
            Notification notification) {

        NotificationResponse response =
                new NotificationResponse();

        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setRead(notification.isRead());

        if (notification.getTicket() != null) {
            response.setTicketId(
                    notification.getTicket().getId());
        }

        response.setCreatedAt(notification.getCreatedAt());

        return response;
    }
}
