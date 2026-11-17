
package com.itservicedesk.backend.service;

import com.itservicedesk.backend.dto.DtoMapper;
import com.itservicedesk.backend.dto.SLAPolicyRequest;
import com.itservicedesk.backend.dto.SLAPolicyResponse;
import com.itservicedesk.backend.entity.SLAPolicy;
import com.itservicedesk.backend.entity.TicketPriority;
import com.itservicedesk.backend.repository.SLAPolicyRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SLAPolicyService {

    private final SLAPolicyRepository slaPolicyRepository;

    public SLAPolicyService(SLAPolicyRepository slaPolicyRepository) {
        this.slaPolicyRepository = slaPolicyRepository;
    }

    public List<SLAPolicyResponse> getAllPolicies() {
        return slaPolicyRepository.findAll()
                .stream()
                .map(DtoMapper::toSLAPolicyResponse)
                .toList();
    }

    public SLAPolicyResponse getPolicyByPriority(TicketPriority priority) {

        if (priority == null) {
            throw new IllegalArgumentException("Priority is required");
        }

        SLAPolicy policy = slaPolicyRepository.findByPriority(priority)
                .orElseThrow(() ->
                        new EntityNotFoundException("SLA policy not found"));

        return DtoMapper.toSLAPolicyResponse(policy);
    }

    public SLAPolicyResponse savePolicy(SLAPolicyRequest request) {

        if (request == null
                || request.getPriority() == null
                || request.getResponseTimeHours() == null
                || request.getResolutionTimeHours() == null
                || request.getResponseTimeHours() <= 0
                || request.getResolutionTimeHours() <= 0
                || request.getResponseTimeHours() >= request.getResolutionTimeHours()) {

            throw new IllegalArgumentException(
                    "Invalid SLA configuration. Response time must be positive and less than resolution time."
            );
        }

        SLAPolicy policy = slaPolicyRepository
                .findByPriority(request.getPriority())
                .orElseGet(SLAPolicy::new);

        policy.setPriority(request.getPriority());
        policy.setResponseTimeHours(request.getResponseTimeHours());
        policy.setResolutionTimeHours(request.getResolutionTimeHours());

        SLAPolicy savedPolicy = slaPolicyRepository.save(policy);

        return DtoMapper.toSLAPolicyResponse(savedPolicy);
    }

    public void deletePolicy(Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid SLA policy ID");
        }

        if (!slaPolicyRepository.existsById(id)) {
            throw new EntityNotFoundException("SLA policy not found");
        }

        slaPolicyRepository.deleteById(id);
    }
}
