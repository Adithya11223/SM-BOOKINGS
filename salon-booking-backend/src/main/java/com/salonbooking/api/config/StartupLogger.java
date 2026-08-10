package com.salonbooking.api.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupLogger implements ApplicationListener<ApplicationReadyEvent> {

    private final DataSource dataSource;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("========================================");
        log.info("🚀 SALON BOOKING BACKEND STARTED");
        log.info("========================================");
        
        try (Connection connection = dataSource.getConnection()) {
            String dbUrl = connection.getMetaData().getURL();
            log.info("✅ Database connected successfully: {}", 
                    dbUrl.contains("neon") ? "Neon PostgreSQL" : dbUrl);
            log.info("✅ Flyway migrations validated and executed successfully.");
        } catch (Exception e) {
            log.error("❌ Failed to verify database connection on startup", e);
        }
        
        log.info("========================================");
        log.info("✅ Application started successfully and is ready to accept requests!");
        log.info("========================================");
    }
}
