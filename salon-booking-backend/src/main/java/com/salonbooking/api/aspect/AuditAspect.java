package com.salonbooking.api.aspect;

import com.salonbooking.api.annotation.AuditLog;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
@Slf4j
public class AuditAspect {

    @AfterReturning(value = "@annotation(com.salonbooking.api.annotation.AuditLog)")
    public void logAuditActivity(JoinPoint joinPoint) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            AuditLog auditLogAnnotation = method.getAnnotation(AuditLog.class);
            String action = auditLogAnnotation.action();

            String user = "System/Public";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                user = auth.getName();
            }

            log.info("AUDIT LOG -> Action: [{}], User: [{}], Method: [{}]", action, user, method.getName());
        } catch (Exception e) {
            log.error("Failed to write audit log", e);
        }
    }
}
