
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.DtoMapper;
import com.itservicedesk.backend.dto.NotificationResponse;
import com.itservicedesk.backend.entity.Notification;
import com.itservicedesk.backend.entity.Role;
import com.itservicedesk.backend.entity.Ticket;
import com.itservicedesk.backend.entity.User;
import com.itservicedesk.backend.repository.NotificationRepository;
import com.itservicedesk.backend.repository.TicketRepository;
import com.itservicedesk.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            TicketRepository ticketRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    // GET NOTIFICATIONS BY USER
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUser(Long userId) {

        checkUserAccess(userId);

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(DtoMapper::toNotificationResponse)
                .toList();
    }

    // GET UNREAD NOTIFICATIONS
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long userId) {

        checkUserAccess(userId);

        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(DtoMapper::toNotificationResponse)
                .toList();
    }

    // GET UNREAD COUNT
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {

        checkUserAccess(userId);

        return notificationRepository
                .countByUserIdAndReadFalse(userId);
    }

    // CREATE NOTIFICATION - BACKEND USE
    public NotificationResponse createNotification(
            Long userId,
            Long ticketId,
            String title,
            String message,
            String type) {

        if (userId == null
                || title == null || title.isBlank()
                || message == null || message.isBlank()
                || type == null || type.isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid notification details");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);

        if (ticketId != null) {

            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() ->
                            new RuntimeException("Ticket not found"));

            notification.setTicket(ticket);
        }

        Notification savedNotification =
                notificationRepository.save(notification);

        return DtoMapper.toNotificationResponse(savedNotification);
    }

    // MARK NOTIFICATION AS READ
    public NotificationResponse markAsRead(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        checkNotificationOwnership(notification);

        notification.setRead(true);

        Notification savedNotification =
                notificationRepository.save(notification);

        return DtoMapper.toNotificationResponse(savedNotification);
    }

    // DELETE NOTIFICATION
    public void deleteNotification(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        checkNotificationOwnership(notification);

        notificationRepository.delete(notification);
    }

    // GET LOGGED-IN USER
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException("User is not authenticated");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Logged-in user not found"));
    }

    // CHECK USER ACCESS
    private void checkUserAccess(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !currentUser.getId().equals(userId)) {

            throw new RuntimeException(
                    "You are not allowed to access these notifications");
        }
    }

    // CHECK NOTIFICATION OWNERSHIP
    private void checkNotificationOwnership(Notification notification) {

        User currentUser = getCurrentUser();

        boolean isOwner =
                notification.getUser().getId().equals(currentUser.getId());

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new RuntimeException(
                    "You are not allowed to modify this notification");
        }
    }
}
