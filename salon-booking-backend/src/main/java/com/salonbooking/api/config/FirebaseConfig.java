package com.salonbooking.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.credentials.base64:}")
    private String firebaseCredentialsBase64;

    @Bean
    public FirebaseApp firebaseApp() {
        if (firebaseCredentialsBase64 == null || firebaseCredentialsBase64.trim().isEmpty()) {
            log.warn("Firebase credentials not provided. Push notifications will be disabled.");
            return null;
        }

        try {
            byte[] decodedBytes = Base64.getDecoder().decode(firebaseCredentialsBase64);
            InputStream serviceAccount = new ByteArrayInputStream(decodedBytes);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                return FirebaseApp.initializeApp(options);
            } else {
                return FirebaseApp.getInstance();
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase App", e);
            return null;
        }
    }
}
