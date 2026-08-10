package com.salonbooking.api.service;

import com.salonbooking.api.entity.Notification;

public interface PushNotificationService {
    void sendPushNotification(Notification notification);
}
