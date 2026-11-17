
package com.itservicedesk.backend.repository;

import com.itservicedesk.backend.entity.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemSettingsRepository
        extends JpaRepository<SystemSettings, Long> {

    Optional<SystemSettings> findFirstByOrderByIdAsc();
}
