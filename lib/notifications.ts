import { prisma } from './prisma';

export type NotificationType =
  | 'BOOKING_UPDATE'
  | 'PROCUREMENT'
  | 'PAYMENT'
  | 'DISPUTE'
  | 'ADMIN';

interface NotificationData {
  entityId?: string;
  entityType?: string;
  data?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function notify(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: NotificationData
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        entityId: data?.entityId,
        entityType: data?.entityType,
        data: data?.data || {},
        isRead: false,
      },
    });

    // TODO: Send email notification if user has email notifications enabled
    // TODO: Send push notification if user has push enabled
    // TODO: Send SMS if critical notification

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Send notification to multiple users
 */
export async function notifyMany(
  userIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  data?: NotificationData
) {
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type,
        title,
        body,
        entityId: data?.entityId,
        entityType: data?.entityType,
        data: data?.data || {},
        isRead: false,
      })),
    });

    return notifications;
  } catch (error) {
    console.error('Error creating notifications:', error);
    return null;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  try {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
}

/**
 * Mark all user notifications as read
 */
export async function markAllAsRead(userId: string) {
  try {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return null;
  }
}

/**
 * Booking notification helpers
 */
export const bookingNotifications = {
  created: async (userId: string, bookingId: string, chefName: string) => {
    return notify(
      userId,
      'BOOKING_UPDATE',
      'Booking Created',
      `Your booking with ${chefName} has been created and is awaiting confirmation.`,
      { entityId: bookingId, entityType: 'Booking' }
    );
  },

  confirmed: async (userId: string, bookingId: string, date: Date) => {
    return notify(
      userId,
      'BOOKING_UPDATE',
      'Booking Confirmed',
      `Your booking on ${date.toLocaleDateString()} has been confirmed by the chef.`,
      { entityId: bookingId, entityType: 'Booking' }
    );
  },

  cancelled: async (userId: string, bookingId: string, reason?: string) => {
    return notify(
      userId,
      'BOOKING_UPDATE',
      'Booking Cancelled',
      reason || 'Your booking has been cancelled.',
      { entityId: bookingId, entityType: 'Booking' }
    );
  },

  completed: async (userId: string, bookingId: string) => {
    return notify(
      userId,
      'BOOKING_UPDATE',
      'Booking Completed',
      'Your booking is complete. Please leave a review for the chef!',
      { entityId: bookingId, entityType: 'Booking' }
    );
  },
};

/**
 * Procurement notification helpers
 */
export const procurementNotifications = {
  orderPlaced: async (userId: string, orderId: string, retailerName: string) => {
    return notify(
      userId,
      'PROCUREMENT',
      'Order Placed',
      `Your order with ${retailerName} has been placed.`,
      { entityId: orderId, entityType: 'ProcurementOrder' }
    );
  },

  orderDelivered: async (userId: string, orderId: string) => {
    return notify(
      userId,
      'PROCUREMENT',
      'Order Delivered',
      'Your procurement order has been delivered. Please upload the receipt for reconciliation.',
      { entityId: orderId, entityType: 'ProcurementOrder' }
    );
  },

  itemSubstituted: async (
    userId: string,
    orderId: string,
    itemName: string,
    substituteName: string
  ) => {
    return notify(
      userId,
      'PROCUREMENT',
      'Item Substituted',
      `${itemName} was substituted with ${substituteName} in your order.`,
      { entityId: orderId, entityType: 'ProcurementOrder' }
    );
  },

  cutoffAlert: async (userId: string, bookingId: string, hours: number) => {
    return notify(
      userId,
      'PROCUREMENT',
      'Procurement Cut-off Alert',
      `Procurement cut-off in ${hours} hours. Please ensure all items are ordered.`,
      { entityId: bookingId, entityType: 'Booking' }
    );
  },
};

/**
 * Payment notification helpers
 */
export const paymentNotifications = {
  received: async (userId: string, paymentId: string, amount: number) => {
    return notify(
      userId,
      'PAYMENT',
      'Payment Received',
      `Payment of $${amount.toFixed(2)} has been received.`,
      { entityId: paymentId, entityType: 'Payment' }
    );
  },

  refundApproved: async (userId: string, refundId: string, amount: number) => {
    return notify(
      userId,
      'PAYMENT',
      'Refund Approved',
      `Your refund of $${amount.toFixed(2)} has been approved and will be processed shortly.`,
      { entityId: refundId, entityType: 'Refund' }
    );
  },

  payoutProcessed: async (userId: string, payoutId: string, amount: number) => {
    return notify(
      userId,
      'PAYMENT',
      'Payout Processed',
      `Your payout of $${amount.toFixed(2)} has been processed.`,
      { entityId: payoutId, entityType: 'Payout' }
    );
  },
};

/**
 * Dispute notification helpers
 */
export const disputeNotifications = {
  opened: async (userId: string, disputeId: string, bookingId: string) => {
    return notify(
      userId,
      'DISPUTE',
      'Dispute Opened',
      'A dispute has been opened for your booking. Our team will review it shortly.',
      { entityId: disputeId, entityType: 'Dispute' }
    );
  },

  assigned: async (userId: string, disputeId: string, staffName: string) => {
    return notify(
      userId,
      'DISPUTE',
      'Dispute Assigned',
      `Your dispute has been assigned to ${staffName} for review.`,
      { entityId: disputeId, entityType: 'Dispute' }
    );
  },

  resolved: async (userId: string, disputeId: string, resolution: string) => {
    return notify(
      userId,
      'DISPUTE',
      'Dispute Resolved',
      `Your dispute has been resolved: ${resolution}`,
      { entityId: disputeId, entityType: 'Dispute' }
    );
  },
};

/**
 * Admin notification helpers
 */
export const adminNotifications = {
  chefApproved: async (userId: string) => {
    return notify(
      userId,
      'ADMIN',
      'Chef Application Approved',
      'Congratulations! Your chef application has been approved. You can now start accepting bookings.',
      { entityType: 'Chef' }
    );
  },

  chefSuspended: async (userId: string, reason: string) => {
    return notify(
      userId,
      'ADMIN',
      'Account Suspended',
      `Your account has been suspended: ${reason}`,
      { entityType: 'User' }
    );
  },

  certificationExpiring: async (userId: string, certName: string, daysUntil: number) => {
    return notify(
      userId,
      'ADMIN',
      'Certification Expiring Soon',
      `Your ${certName} certification will expire in ${daysUntil} days. Please renew it to continue receiving bookings.`,
      { entityType: 'Certification' }
    );
  },
};
