
package com.itservicedesk.backend.controller;

import com.itservicedesk.backend.dto.TicketCommentRequest;
import com.itservicedesk.backend.dto.TicketCommentResponse;
import com.itservicedesk.backend.service.TicketCommentService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketCommentController {

    private final TicketCommentService commentService;

    public TicketCommentController(
            TicketCommentService commentService) {
        this.commentService = commentService;
    }

    // GET COMMENTS BY TICKET
    @GetMapping("/ticket/{ticketId}")
    public List<TicketCommentResponse> getCommentsByTicket(
            @PathVariable Long ticketId) {

        return commentService.getCommentsByTicket(ticketId);
    }

    // GET COMMENTS BY USER
    @GetMapping("/user/{userId}")
    public List<TicketCommentResponse> getCommentsByUser(
            @PathVariable Long userId) {

        return commentService.getCommentsByUser(userId);
    }

    // ADD COMMENT
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketCommentResponse addComment(
            @Valid @RequestBody TicketCommentRequest request) {

        return commentService.addComment(request);
    }

    // DELETE COMMENT
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
    }
}
