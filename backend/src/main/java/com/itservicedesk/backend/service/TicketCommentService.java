
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.DtoMapper;
import com.itservicedesk.backend.dto.TicketCommentRequest;
import com.itservicedesk.backend.dto.TicketCommentResponse;
import com.itservicedesk.backend.entity.Role;
import com.itservicedesk.backend.entity.Ticket;
import com.itservicedesk.backend.entity.TicketComment;
import com.itservicedesk.backend.entity.User;
import com.itservicedesk.backend.repository.TicketCommentRepository;
import com.itservicedesk.backend.repository.TicketRepository;
import com.itservicedesk.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketCommentService(
            TicketCommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository) {

        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // GET COMMENTS BY TICKET
    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getCommentsByTicket(Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found"));

        User currentUser = getCurrentUser();

        checkTicketAccess(ticket, currentUser);

        return commentRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(DtoMapper::toCommentResponse)
                .toList();
    }

    // GET COMMENTS BY USER
    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getCommentsByUser(Long userId) {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !currentUser.getId().equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot view another user's comments");
        }

        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "User not found");
        }

        return commentRepository.findByUserId(userId)
                .stream()
                .map(DtoMapper::toCommentResponse)
                .toList();
    }

    // ADD COMMENT
    public TicketCommentResponse addComment(TicketCommentRequest request) {

        if (request == null
                || request.getTicketId() == null
                || request.getMessage() == null
                || request.getMessage().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid comment request");
        }

        Ticket ticket = ticketRepository
                .findById(request.getTicketId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found"));

        User currentUser = getCurrentUser();

        checkTicketAccess(ticket, currentUser);

        TicketComment comment = new TicketComment();

        comment.setMessage(request.getMessage().trim());
        comment.setTicket(ticket);
        comment.setUser(currentUser);

        TicketComment savedComment = commentRepository.save(comment);

        return DtoMapper.toCommentResponse(savedComment);
    }

    // DELETE COMMENT
    public void deleteComment(Long id) {

        TicketComment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Comment not found"));

        User currentUser = getCurrentUser();

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isCommentOwner =
                comment.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isCommentOwner) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // GET LOGGED-IN USER
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in first");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    // CHECK TICKET ACCESS
    private void checkTicketAccess(Ticket ticket, User user) {

        boolean isAdmin = user.getRole() == Role.ADMIN;

        boolean isEmployee =
                ticket.getEmployee().getId().equals(user.getId());

        boolean isAssignedTechnician =
                ticket.getTechnician() != null
                && ticket.getTechnician().getId().equals(user.getId());

        if (!isAdmin && !isEmployee && !isAssignedTechnician) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this ticket");
        }
    }
}
