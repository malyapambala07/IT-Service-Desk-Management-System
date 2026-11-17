
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.DtoMapper;
import com.itservicedesk.backend.dto.UserRequest;
import com.itservicedesk.backend.dto.UserResponse;
import com.itservicedesk.backend.entity.Role;
import com.itservicedesk.backend.entity.User;
import com.itservicedesk.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(DtoMapper::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        return DtoMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        return DtoMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Role is required");
        }

        return userRepository.findByRole(role)
                .stream()
                .map(DtoMapper::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsersByRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Role is required");
        }

        return userRepository.findByRoleAndActiveTrue(role)
                .stream()
                .map(DtoMapper::toUserResponse)
                .toList();
    }

    public UserResponse createUser(UserRequest request) {

        validateUserDetails(request);

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        validatePassword(request.getPassword());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = DtoMapper.toUser(request);

        user.setPassword(
                passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        return DtoMapper.toUserResponse(savedUser);
    }

    public UserResponse updateUser(Long id, UserRequest request) {

        validateUserDetails(request);

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        userRepository.findByEmail(request.getEmail())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(id)) {
                        throw new IllegalArgumentException(
                                "Email already belongs to another user");
                    }
                });

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            validatePassword(request.getPassword());

            user.setPassword(
                    passwordEncoder.encode(request.getPassword()));
        }

        return DtoMapper.toUserResponse(
                userRepository.save(user));
    }

    public void deleteUser(Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }

        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found");
        }

        userRepository.deleteById(id);
    }

    private void validateUserDetails(UserRequest request) {

        if (request == null
                || request.getFullName() == null
                || request.getFullName().isBlank()
                || request.getEmail() == null
                || request.getEmail().isBlank()
                || request.getRole() == null) {

            throw new IllegalArgumentException(
                    "Valid name, email and role are required");
        }
    }

    private void validatePassword(String password) {

        if (password.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters");
        }
    }
}
