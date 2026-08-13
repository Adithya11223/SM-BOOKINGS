package com.salonbooking.api.service;

import com.salonbooking.api.entity.Notification;
import com.salonbooking.api.entity.Customer;
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

import java.util.Arrays;
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
    private UUID customerCId;
    private UUID customerDId;
    private UserDetailsImpl customerAUser;
    private UserDetailsImpl customerBUser;
    private UserDetailsImpl customerCUser;
    private UserDetailsImpl customerDUser;
    private UserDetailsImpl adminUser;

    @BeforeEach
    void setUp() {
        customerAId = UUID.randomUUID();
        customerBId = UUID.randomUUID();
        customerCId = UUID.randomUUID();
        customerDId = UUID.randomUUID();

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

        customerCUser = new UserDetailsImpl(
                customerCId,
                "Customer C",
                "customerC@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")),
                true
        );

        customerDUser = new UserDetailsImpl(
                customerDId,
                "Customer D",
                "customerD@example.com",
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

    @Test
    void markAllAsReadScopesToAuthenticatedCustomer() {
        notificationService.markAllAsRead("CUSTOMER", customerAId);
        verify(webSocketEventPublisher).publishNotificationSync("CUSTOMER", customerAId, "READ_ALL");
    }

    @Test
    void deleteAllNotificationsScopesToAuthenticatedCustomer() {
        notificationService.deleteAllNotifications("CUSTOMER", customerAId);
        verify(webSocketEventPublisher).publishNotificationSync("CUSTOMER", customerAId, "CLEAR_ALL");
    }

    @Test
    void broadcastAnnouncementDeliversToAllCustomers() {
        Customer cA = new Customer(); cA.setId(customerAId);
        Customer cB = new Customer(); cB.setId(customerBId);

        when(customerRepository.findAll()).thenReturn(Arrays.asList(cA, cB));
        Notification notifTemplate = Notification.builder().title("Promo Ad").message("Sale").build();
        when(notificationGenerator.generateBusinessNotification(anyString(), anyString(), any())).thenReturn(notifTemplate);

        notificationService.broadcastAnnouncement("Promo Ad", "Sale");

        verify(notificationRepository, times(2)).save(any(Notification.class));
        verify(pushNotificationService, times(1)).sendPushNotification(any(Notification.class));
    }

    @Mock
    private com.salonbooking.api.repository.BookingItemRepository bookingItemRepository;

    @InjectMocks
    private com.salonbooking.api.service.impl.BookingServiceImpl bookingServiceImpl;

    @Test
    void confirmedBookingReceivesAppointmentReminder() {
        Customer cA = new Customer(); cA.setId(customerAId); cA.setName("Customer A");
        java.time.LocalDateTime targetTime = java.time.LocalDateTime.now().plusMinutes(30);
        com.salonbooking.api.entity.Booking confirmedBooking = com.salonbooking.api.entity.Booking.builder()
                .bookingNumber("B-100")
                .bookingStatus(com.salonbooking.api.enums.BookingStatus.CONFIRMED)
                .bookingDate(targetTime.toLocalDate())
                .bookingTime(targetTime.toLocalTime())
                .customer(cA)
                .reminderSent(false)
                .build();

        when(bookingRepository.findPendingReminders(com.salonbooking.api.enums.BookingStatus.CONFIRMED))
                .thenReturn(Collections.singletonList(confirmedBooking));

        Notification reminderNotif = Notification.builder()
                .title("Upcoming Appointment Reminder ⏰")
                .message("Reminder for Customer A")
                .receiverType("CUSTOMER")
                .receiverId(customerAId)
                .build();
        when(notificationGenerator.generateAppointmentReminderNotification(confirmedBooking)).thenReturn(reminderNotif);

        bookingServiceImpl.processAppointmentReminders();

        assertTrue(confirmedBooking.getReminderSent());
        verify(notificationRepository).save(reminderNotif);
        verify(webSocketEventPublisher).publishNotificationUpdate(reminderNotif);
        verify(pushNotificationService).sendPushNotification(reminderNotif);
        verify(bookingRepository).save(confirmedBooking);
    }

    @Test
    void repeatedSchedulerExecutionDoesNotDuplicateReminder() {
        when(bookingRepository.findPendingReminders(com.salonbooking.api.enums.BookingStatus.CONFIRMED))
                .thenReturn(Collections.emptyList());

        bookingServiceImpl.processAppointmentReminders();

        verify(pushNotificationService, never()).sendPushNotification(any());
        verify(notificationRepository, never()).save(any());
    }
}
