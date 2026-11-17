
package com.itservicedesk.backend;

import com.itservicedesk.backend.entity.Role;
import com.itservicedesk.backend.entity.User;
import com.itservicedesk.backend.entity.SLAPolicy;
import com.itservicedesk.backend.entity.TicketPriority;

import com.itservicedesk.backend.repository.UserRepository;
import com.itservicedesk.backend.repository.SLAPolicyRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Bean
    CommandLineRunner initializeData(
            UserRepository userRepository,
            SLAPolicyRepository slaPolicyRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // Create default Admin account if it does not exist
            if (!userRepository.existsByEmail(adminEmail)) {

                User admin = new User();

                admin.setFullName(adminName);
                admin.setEmail(adminEmail);
                admin.setPassword(
                        passwordEncoder.encode(adminPassword));
                admin.setRole(Role.ADMIN);
                admin.setActive(true);

                userRepository.save(admin);
            }

            // Initialize any missing SLA policies
            createPolicyIfMissing(
                    slaPolicyRepository,
                    TicketPriority.CRITICAL, 1, 4);

            createPolicyIfMissing(
                    slaPolicyRepository,
                    TicketPriority.HIGH, 4, 8);

            createPolicyIfMissing(
                    slaPolicyRepository,
                    TicketPriority.MEDIUM, 8, 24);

            createPolicyIfMissing(
                    slaPolicyRepository,
                    TicketPriority.LOW, 24, 72);
        };
    }

    private void createPolicyIfMissing(
            SLAPolicyRepository repository,
            TicketPriority priority,
            int responseTime,
            int resolutionTime) {

        if (repository.findByPriority(priority).isPresent()) {
            return;
        }

        SLAPolicy policy = new SLAPolicy();

        policy.setPriority(priority);
        policy.setResponseTimeHours(responseTime);
        policy.setResolutionTimeHours(resolutionTime);

        repository.save(policy);
    }
}
