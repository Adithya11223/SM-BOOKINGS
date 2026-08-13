package com.salonbooking.api.service;

import com.salonbooking.api.entity.Notification;
import com.salonbooking.api.repository.NotificationRepository;
import com.salonbooking.api.repository.FcmTokenRepository;
import com.salonbooking.api.security.UserDetailsImpl;
import com.salonbooking.api.service.impl.NotificationServiceImpl;
import com.salonbooking.api.service.impl.PushNotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationIsolationTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private FcmTokenRepository fcmTokenRepository;

    @Mock
    private com.salonbooking.api.mapper.NotificationMapper notificationMapper;

    @Mock
    private com.salonbooking.api.util.NotificationGenerator notificationGenerator;

    @Mock
    private WebSocketEventPublisher webSocketEventPublisher;

    @Mock
    private PushNotificationService pushNotificationService;

    @Mock
    private com.salonbooking.api.repository.CustomerRepository customerRepository;

    @Mock
    private com.salonbooking.api.repository.BookingUpdateRepository bookingUpdateRepository;

    @Mock
    private com.salonbooking.api.repository.BookingRepository bookingRepository;

    @Mock
    private com.salonbooking.api.mapper.BookingMapper bookingMapper;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private PushNotificationServiceImpl pushNotificationServiceImpl;

    private UUID customerAId;
    private UUID customerBId;
    private UserDetailsImpl customerAUser;
    private UserDetailsImpl customerBUser;
    private UserDetailsImpl adminUser;

    @BeforeEach
    void setUp() {
        customerAId = UUID.randomUUID();
        customerBId = UUID.randomUUID();

        pushNotificationServiceImpl = new PushNotificationServiceImpl(fcmTokenRepository);

        customerAUser = new UserDetailsImpl(
                customerAId,
                "Customer A",
                "customerA@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")),
                true
        );

        customerBUser = new UserDetailsImpl(
                customerBId,
                "Customer B",
                "customerB@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")),
                true
        );

        adminUser = new UserDetailsImpl(
                UUID.randomUUID(),
                "Admin User",
                "admin@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")),
                true
        );
    }

    @Test
    void customerCannotAccessOtherCustomerNotification() {
        UUID notifId = UUID.randomUUID();
        Notification customerANotif = Notification.builder()
                .receiverType("CUSTOMER")
                .receiverId(customerAId)
                .isRead(false)
                .build();
        customerANotif.setId(notifId);

        when(notificationRepository.findById(notifId)).thenReturn(Optional.of(customerANotif));

        assertThrows(AccessDeniedException.class, () -> {
            notificationService.markAsRead(notifId, customerBUser);
        });

        assertThrows(AccessDeniedException.class, () -> {
            notificationService.deleteNotification(notifId, customerBUser);
        });
    }

    @Test
    void customerCanAccessOwnNotification() {
        UUID notifId = UUID.randomUUID();
        Notification customerANotif = Notification.builder()
                .receiverType("CUSTOMER")
                .receiverId(customerAId)
                .isRead(false)
                .build();
        customerANotif.setId(notifId);

        when(notificationRepository.findById(notifId)).thenReturn(Optional.of(customerANotif));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        assertDoesNotThrow(() -> {
            notificationService.markAsRead(notifId, customerAUser);
        });
    }

    @Test
    void customerCannotAccessAdminNotification() {
        UUID notifId = UUID.randomUUID();
        Notification adminNotif = Notification.builder()
                .receiverType("ADMIN")
                .receiverId(null)
                .isRead(false)
                .build();
        adminNotif.setId(notifId);

        when(notificationRepository.findById(notifId)).thenReturn(Optional.of(adminNotif));

        assertThrows(AccessDeniedException.class, () -> {
            notificationService.markAsRead(notifId, customerAUser);
        });
    }

    @Test
    void adminCannotAccessCustomerPrivateNotification() {
        UUID notifId = UUID.randomUUID();
        Notification customerNotif = Notification.builder()
                .receiverType("CUSTOMER")
                .receiverId(customerAId)
                .isRead(false)
                .build();
        customerNotif.setId(notifId);

        when(notificationRepository.findById(notifId)).thenReturn(Optional.of(customerNotif));

        assertThrows(AccessDeniedException.class, () -> {
            notificationService.markAsRead(notifId, adminUser);
        });
    }

    @Test
    void customerGetNotificationsReturnsOnlyOwnNotifications() {
        notificationService.getCustomerNotifications(customerAId);
        verify(notificationRepository).findForCustomer("CUSTOMER", customerAId);
    }

    @Test
    void pushNotificationForSpecificCustomerDoesNotFallbackToAllCustomers() {
        Notification customerANotif = Notification.builder()
                .receiverType("CUSTOMER")
                .receiverId(customerAId)
                .title("Private Alert")
                .message("Only for A")
                .build();

        when(fcmTokenRepository.findByCustomerId(customerAId)).thenReturn(Collections.emptyList());

        pushNotificationServiceImpl.sendPushNotification(customerANotif);

        verify(fcmTokenRepository, times(1)).findByCustomerId(customerAId);
        verify(fcmTokenRepository, never()).findCustomerTokens();
    }
}
