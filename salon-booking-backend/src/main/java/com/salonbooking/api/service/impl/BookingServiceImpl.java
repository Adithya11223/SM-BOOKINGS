package com.salonbooking.api.service.impl;

import com.salonbooking.api.dto.request.CreateBookingRequest;
import com.salonbooking.api.dto.request.UpdateBookingStatusRequest;
import com.salonbooking.api.dto.response.BookingDetailResponse;
import com.salonbooking.api.dto.response.BookingResponse;
import com.salonbooking.api.entity.Booking;
import com.salonbooking.api.entity.BookingItem;
import com.salonbooking.api.entity.BookingUpdate;
import com.salonbooking.api.entity.Customer;
import com.salonbooking.api.entity.Notification;
import com.salonbooking.api.entity.enums.TargetRole;
import com.salonbooking.api.entity.enums.UpdateType;
import com.salonbooking.api.enums.BookingStatus;
import com.salonbooking.api.exception.BusinessException;
import com.salonbooking.api.exception.ResourceNotFoundException;
import com.salonbooking.api.mapper.BookingMapper;
import com.salonbooking.api.repository.BookingItemRepository;
import com.salonbooking.api.repository.BookingRepository;
import com.salonbooking.api.repository.NotificationRepository;
import com.salonbooking.api.service.BookingService;
import com.salonbooking.api.service.CustomerService;
import com.salonbooking.api.service.ServiceService;
import com.salonbooking.api.util.BookingReferenceGenerator;
import com.salonbooking.api.util.DateValidator;
import com.salonbooking.api.util.NotificationGenerator;
import com.salonbooking.api.util.PriceCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingItemRepository bookingItemRepository;
    private final com.salonbooking.api.repository.BookingUpdateRepository bookingUpdateRepository;
    private final NotificationRepository notificationRepository;
    private final com.salonbooking.api.repository.FcmTokenRepository fcmTokenRepository;
    private final com.salonbooking.api.repository.ReviewRepository reviewRepository;
    private final com.salonbooking.api.mapper.ReviewMapper reviewMapper;
    
    private final BookingMapper bookingMapper;
    
    private final CustomerService customerService;
    private final ServiceService serviceService;
    
    private final BookingReferenceGenerator referenceGenerator;
    private final DateValidator dateValidator;
    private final PriceCalculator priceCalculator;
    private final NotificationGenerator notificationGenerator;
    private final com.salonbooking.api.service.PushNotificationService pushNotificationService;
    private final com.salonbooking.api.service.WebSocketEventPublisher webSocketEventPublisher;

    private BookingResponse enrichBookingResponse(Booking b) {
        BookingResponse resp = bookingMapper.toResponse(b);
        if (b.getItems() != null) {
            resp.setItems(b.getItems().stream().map(bookingMapper::toItemResponse).collect(Collectors.toList()));
        }
        if (reviewRepository != null && b.getId() != null) {
            resp.setReviews(reviewRepository.findByBookingId(b.getId()).stream()
                    .map(reviewMapper::toResponse)
                    .collect(Collectors.toList()));
        }
        return resp;
    }

    private BookingDetailResponse enrichBookingDetailResponse(Booking b) {
        BookingDetailResponse detail = bookingMapper.toDetailResponse(b);
        if (reviewRepository != null && b.getId() != null) {
            detail.setReviews(reviewRepository.findByBookingId(b.getId()).stream()
                    .map(reviewMapper::toResponse)
                    .collect(Collectors.toList()));
        }
        return detail;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllBookings().stream()
                .map(this::enrichBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingById(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        return enrichBookingDetailResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingByNumber(String bookingNumber) {
        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return enrichBookingDetailResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByReferences(List<String> references) {
        if (references == null || references.isEmpty()) {
            return List.of();
        }
        return bookingRepository.findByBookingNumberIn(references).stream()
                .map(this::enrichBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingDetailResponse createBooking(CreateBookingRequest request) {
        dateValidator.validateBookingDate(request.getBookingDate());

        Customer customer = customerService.getOrCreateCustomer(
                request.getCustomerName(),
                request.getCustomerPhoneNumber(),
                request.getCustomerEmail()
        );

        Booking booking = Booking.builder()
                .bookingNumber(referenceGenerator.generateBookingNumber(request.getBookingType()))
                .customer(customer)
                .bookingType(request.getBookingType())
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .notes(request.getNotes())
                .address(request.getAddress())
                .googleMapsLink(request.getGoogleMapsLink())
                .eventType(request.getEventType())
                .peopleCount(request.getPeopleCount())
                // Placeholders that will be calculated
                .totalAmount(BigDecimal.ZERO)
                .totalDuration(0)
                .build();

        // Map items and create snapshots
        List<BookingItem> items = request.getItems().stream().map(itemRequest -> {
            com.salonbooking.api.entity.Service serviceEntity = serviceService.getServiceEntityById(itemRequest.getServiceId());
            
            if (!serviceEntity.getIsVisible()) {
                throw new BusinessException("Cannot book a hidden service: " + serviceEntity.getName());
            }

            BigDecimal subtotal = serviceEntity.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            return BookingItem.builder()
                    .booking(booking)
                    .service(serviceEntity)
                    .serviceNameSnapshot(serviceEntity.getName())
                    .priceSnapshot(serviceEntity.getPrice())
                    .durationSnapshot(serviceEntity.getDurationMinutes())
                    .quantity(itemRequest.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).collect(Collectors.toList());

        booking.getItems().addAll(items);
        booking.setTotalAmount(priceCalculator.calculateTotalAmount(items));
        booking.setTotalDuration(priceCalculator.calculateTotalDuration(items));

        Booking savedBooking = bookingRepository.save(booking);

        BookingUpdate adminUpdate = BookingUpdate.builder()
                .booking(savedBooking)
                .updateType(UpdateType.CREATED)
                .targetRole(TargetRole.ADMIN)
                .build();
        adminUpdate = bookingUpdateRepository.save(adminUpdate);
        savedBooking.getBookingUpdates().add(adminUpdate);

        if (request.getDeviceId() != null) {
            fcmTokenRepository.findByDeviceId(request.getDeviceId()).ifPresent(token -> {
                token.setCustomerId(customer.getId());
                fcmTokenRepository.save(token);
            });
        }
        
        Notification notification = notificationGenerator.generateBookingCreatedNotification(savedBooking);
        notification = notificationRepository.save(notification);
        webSocketEventPublisher.publishNotificationUpdate(notification);
        pushNotificationService.sendPushNotification(notification);

        BookingDetailResponse detailResponse = bookingMapper.toDetailResponse(savedBooking);
        webSocketEventPublisher.publishBookingUpdate("CREATED", detailResponse);

        log.info("Created booking {} for customer {}", savedBooking.getBookingNumber(), customer.getPhoneNumber());
        return detailResponse;
    }

    @Override
    @Transactional
    @com.salonbooking.api.annotation.AuditLog(action = "Update Booking Status")
    public BookingDetailResponse updateBookingStatus(UUID id, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        BookingStatus currentStatus = booking.getBookingStatus();
        BookingStatus newStatus = request.getBookingStatus();

        if (currentStatus == BookingStatus.COMPLETED) {
            throw new BusinessException("Cannot modify a completed booking");
        }
        if (currentStatus == BookingStatus.CANCELLED && newStatus == BookingStatus.COMPLETED) {
            throw new BusinessException("Cannot complete a cancelled booking");
        }

        booking.setBookingStatus(newStatus);
        Booking updatedBooking = bookingRepository.save(booking);

        UpdateType type = newStatus == BookingStatus.CONFIRMED ? UpdateType.CONFIRMED :
                          newStatus == BookingStatus.COMPLETED ? UpdateType.COMPLETED : 
                          UpdateType.CANCELLED;

        BookingUpdate customerUpdate = BookingUpdate.builder()
                .booking(updatedBooking)
                .updateType(type)
                .targetRole(TargetRole.CUSTOMER)
                .build();
        customerUpdate = bookingUpdateRepository.save(customerUpdate);
        updatedBooking.getBookingUpdates().add(customerUpdate);

        if (newStatus == BookingStatus.COMPLETED) {
            customerService.updateCustomerBookingStats(booking.getCustomer());
        }

        Notification notification = notificationGenerator.generateBookingStatusUpdatedNotification(updatedBooking);
        notification = notificationRepository.save(notification);
        webSocketEventPublisher.publishNotificationUpdate(notification);
        pushNotificationService.sendPushNotification(notification);

        BookingDetailResponse detailResponse = bookingMapper.toDetailResponse(updatedBooking);
        webSocketEventPublisher.publishBookingUpdate("UPDATED", detailResponse);

        log.info("Updated booking {} status from {} to {}", updatedBooking.getBookingNumber(), currentStatus, newStatus);
        return detailResponse;
    }

    @Override
    @Transactional
    @com.salonbooking.api.annotation.AuditLog(action = "Partial Accept Booking")
    public BookingDetailResponse partialAcceptBooking(UUID id, List<UUID> acceptedServiceIds) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new BusinessException("Only pending bookings can be partially accepted");
        }

        List<BookingItem> allItems = new ArrayList<>(booking.getItems());
        List<BookingItem> acceptedItems = new ArrayList<>();
        List<BookingItem> rejectedItems = new ArrayList<>();

        for (BookingItem item : allItems) {
            UUID sId = item.getService() != null ? item.getService().getId() : null;
            boolean isAccepted = acceptedServiceIds.contains(item.getId()) 
                    || (sId != null && acceptedServiceIds.contains(sId));
            if (isAccepted) {
                acceptedItems.add(item);
            } else {
                rejectedItems.add(item);
            }
        }

        if (rejectedItems.isEmpty()) {
            UpdateBookingStatusRequest req = new UpdateBookingStatusRequest();
            req.setBookingStatus(BookingStatus.CONFIRMED);
            return updateBookingStatus(id, req);
        }

        if (acceptedItems.isEmpty()) {
            UpdateBookingStatusRequest req = new UpdateBookingStatusRequest();
            req.setBookingStatus(BookingStatus.CANCELLED);
            return updateBookingStatus(id, req);
        }

        // We have a mix.
        // 1. Update original booking to only have accepted items.
        booking.getItems().clear();
        booking.getItems().addAll(acceptedItems);
        booking.setTotalAmount(priceCalculator.calculateTotalAmount(acceptedItems));
        booking.setTotalDuration(priceCalculator.calculateTotalDuration(acceptedItems));
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        Booking updatedOriginal = bookingRepository.save(booking);

        BookingUpdate confirmUpdate = BookingUpdate.builder()
                .booking(updatedOriginal)
                .updateType(UpdateType.CONFIRMED)
                .targetRole(TargetRole.CUSTOMER)
                .build();
        confirmUpdate = bookingUpdateRepository.save(confirmUpdate);
        updatedOriginal.getBookingUpdates().add(confirmUpdate);

        // 2. Create new booking for rejected items.
        Booking rejectedBooking = Booking.builder()
                .bookingNumber(referenceGenerator.generateBookingNumber(booking.getBookingType()))
                .customer(booking.getCustomer())
                .bookingType(booking.getBookingType())
                .bookingStatus(BookingStatus.CANCELLED)
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .notes(booking.getNotes())
                .address(booking.getAddress())
                .googleMapsLink(booking.getGoogleMapsLink())
                .eventType(booking.getEventType())
                .peopleCount(booking.getPeopleCount())
                .build();
        
        List<BookingItem> newRejectedItems = new ArrayList<>();
        for (BookingItem oldItem : rejectedItems) {
            newRejectedItems.add(BookingItem.builder()
                    .booking(rejectedBooking)
                    .service(oldItem.getService())
                    .serviceNameSnapshot(oldItem.getServiceNameSnapshot())
                    .priceSnapshot(oldItem.getPriceSnapshot())
                    .durationSnapshot(oldItem.getDurationSnapshot())
                    .quantity(oldItem.getQuantity())
                    .subtotal(oldItem.getSubtotal())
                    .build());
        }
        
        rejectedBooking.getItems().addAll(newRejectedItems);
        rejectedBooking.setTotalAmount(priceCalculator.calculateTotalAmount(newRejectedItems));
        rejectedBooking.setTotalDuration(priceCalculator.calculateTotalDuration(newRejectedItems));
        
        Booking savedRejected = bookingRepository.save(rejectedBooking);

        BookingUpdate cancelUpdate = BookingUpdate.builder()
                .booking(savedRejected)
                .updateType(UpdateType.CANCELLED)
                .targetRole(TargetRole.CUSTOMER)
                .build();
        cancelUpdate = bookingUpdateRepository.save(cancelUpdate);
        savedRejected.getBookingUpdates().add(cancelUpdate);

        // Notifications
        Notification acceptNotif = notificationGenerator.generateBookingStatusUpdatedNotification(updatedOriginal);
        notificationRepository.save(acceptNotif);
        webSocketEventPublisher.publishNotificationUpdate(acceptNotif);
        pushNotificationService.sendPushNotification(acceptNotif);

        Notification rejectNotif = notificationGenerator.generateBookingStatusUpdatedNotification(savedRejected);
        notificationRepository.save(rejectNotif);
        webSocketEventPublisher.publishNotificationUpdate(rejectNotif);
        pushNotificationService.sendPushNotification(rejectNotif);

        BookingDetailResponse detailResponse = bookingMapper.toDetailResponse(updatedOriginal);
        webSocketEventPublisher.publishBookingUpdate("UPDATED", detailResponse);
        
        BookingDetailResponse rejectedDetailResponse = bookingMapper.toDetailResponse(savedRejected);
        webSocketEventPublisher.publishBookingUpdate("CREATED", rejectedDetailResponse);

        log.info("Partially accepted booking {}, created cancelled booking {}", updatedOriginal.getBookingNumber(), savedRejected.getBookingNumber());
        return detailResponse;
    }

    @Override
    @Transactional
    public void deleteBooking(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        if (booking.getBookingStatus() != BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Only cancelled bookings can be deleted");
        }
        
        bookingRepository.delete(booking);
        log.info("Deleted cancelled booking: {}", id);
    }

    @Override
    @Transactional
    public void markAdminViewed(UUID id) {
        List<BookingUpdate> updates = bookingUpdateRepository.findByBookingIdAndTargetRoleAndIsReadFalse(id, TargetRole.ADMIN);
        if (!updates.isEmpty()) {
            updates.forEach(u -> u.setRead(true));
            bookingUpdateRepository.saveAll(updates);
        }

        // Also mark all admin notifications for this booking as read
        List<Notification> notifs = notificationRepository.findByBookingIdAndReceiverTypeAndIsReadFalse(id, "ADMIN");
        if (!notifs.isEmpty()) {
            notifs.forEach(n -> {
                n.setIsRead(true);
                n.setReadAt(java.time.Instant.now());
            });
            notificationRepository.saveAll(notifs);
            notifs.forEach(webSocketEventPublisher::publishNotificationUpdate);
        }

        bookingRepository.findById(id).ifPresent(booking -> {
            webSocketEventPublisher.publishBookingUpdate("UPDATED", bookingMapper.toDetailResponse(booking));
        });
    }

    @Override
    @Transactional
    public void markCustomerViewed(UUID id) {
        List<BookingUpdate> updates = bookingUpdateRepository.findByBookingIdAndTargetRoleAndIsReadFalse(id, TargetRole.CUSTOMER);
        if (!updates.isEmpty()) {
            updates.forEach(u -> u.setRead(true));
            bookingUpdateRepository.saveAll(updates);
        }

        // Also mark all customer notifications for this booking as read
        List<Notification> notifs = notificationRepository.findByBookingIdAndReceiverTypeAndIsReadFalse(id, "CUSTOMER");
        if (!notifs.isEmpty()) {
            notifs.forEach(n -> {
                n.setIsRead(true);
                n.setReadAt(java.time.Instant.now());
            });
            notificationRepository.saveAll(notifs);
            notifs.forEach(webSocketEventPublisher::publishNotificationUpdate);
        }

        bookingRepository.findById(id).ifPresent(booking -> {
            webSocketEventPublisher.publishBookingUpdate("UPDATED", bookingMapper.toDetailResponse(booking));
        });
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupOldCancelledBookings() {
        java.time.Instant sevenDaysAgo = java.time.Instant.now().minus(7, java.time.temporal.ChronoUnit.DAYS);
        List<Booking> oldCancelledBookings = bookingRepository.findByBookingStatusAndUpdatedAtBefore(BookingStatus.CANCELLED, sevenDaysAgo);
        
        if (!oldCancelledBookings.isEmpty()) {
            bookingRepository.deleteAll(oldCancelledBookings);
            log.info("Cleaned up {} old cancelled bookings", oldCancelledBookings.size());
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void processAppointmentReminders() {
        List<Booking> pendingBookings = bookingRepository.findPendingReminders(BookingStatus.CONFIRMED);
        if (pendingBookings == null || pendingBookings.isEmpty()) {
            return;
        }

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime twoHoursFromNow = now.plusHours(2);

        for (Booking booking : pendingBookings) {
            try {
                if (booking == null || booking.getBookingDate() == null || booking.getBookingStatus() != BookingStatus.CONFIRMED) {
                    continue;
                }
                java.time.LocalTime time = booking.getBookingTime() != null ? booking.getBookingTime() : java.time.LocalTime.MIDNIGHT;
                java.time.LocalDateTime appointmentDateTime = java.time.LocalDateTime.of(booking.getBookingDate(), time);

                if (appointmentDateTime.isBefore(twoHoursFromNow) && appointmentDateTime.isAfter(now.minusHours(1))) {
                    Notification notification = notificationGenerator.generateAppointmentReminderNotification(booking);
                    notificationRepository.save(notification);
                    webSocketEventPublisher.publishNotificationUpdate(notification);
                    pushNotificationService.sendPushNotification(notification);

                    booking.setReminderSent(true);
                    bookingRepository.save(booking);
                    log.info("Sent appointment reminder notification for booking {}", booking.getBookingNumber());
                }
            } catch (Exception e) {
                log.error("Error processing appointment reminder for booking {}: {}", 
                        booking != null ? booking.getBookingNumber() : "unknown", e.getMessage());
            }
        }
    }
}
