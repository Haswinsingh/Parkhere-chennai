import { Booking } from '../models/Booking';
import { ParkingSpace } from '../models/ParkingSpace';
import { sendNotification } from '../services/notificationService';

/**
 * Periodically monitors active bookings:
 * 1. Checks if a booking is 10 minutes away from ending and dispatches 10-minute warning.
 * 2. Checks if a booking has reached/exceeded its end time, calculates overtime, and transitions to 'completed'.
 */
export const runSessionMonitorJob = async (): Promise<void> => {
  try {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // 1. Find active bookings expiring within the next 10 minutes that have NOT yet received the warning
    const warningCandidates = await Booking.find({
      status: 'active',
      tenMinuteWarningSent: false,
      endTime: {
        $gt: now,
        $lte: tenMinutesFromNow,
      },
    }).populate('parkingId', 'name');

    for (const booking of warningCandidates) {
      booking.tenMinuteWarningSent = true;
      await booking.save();

      const parkingName = (booking.parkingId as any)?.name || 'your parking space';
      const formattedEndTime = booking.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Notify driver
      await sendNotification({
        userId: booking.userId,
        type: 'ten_minute_warning',
        title: '10-Minute Parking Expiry Warning',
        message: `Your parking session at ${parkingName} ends at ${formattedEndTime} (in ~10 minutes). Please return to your vehicle.`,
        bookingId: booking._id,
      });

      // Notify host
      await sendNotification({
        userId: booking.ownerId,
        type: 'ten_minute_warning',
        title: 'Driver Session Ending Soon',
        message: `Parking session for booking ${booking._id} at ${parkingName} will conclude at ${formattedEndTime}.`,
        bookingId: booking._id,
      });

      console.log(`[SessionMonitor] Sent 10-minute warning for booking ${booking._id}`);
    }

    // 2. Find active bookings whose endTime has arrived or passed
    const expiredBookings = await Booking.find({
      status: 'active',
      endTime: { $lte: now },
    }).populate('parkingId', 'name pricePerHour');

    for (const booking of expiredBookings) {
      // Calculate overtime if applicable
      const extraMs = now.getTime() - booking.endTime.getTime();
      const extraHours = Math.floor(extraMs / (3600 * 1000));
      let overtimeAmount = 0;

      if (extraHours > 0) {
        overtimeAmount = extraHours * booking.pricePerHour;
      }

      booking.status = 'completed';
      booking.overtimeAmount = overtimeAmount;
      booking.totalAmount = booking.baseAmount + overtimeAmount;
      await booking.save();

      const parkingName = (booking.parkingId as any)?.name || 'parking';

      // Notify driver
      await sendNotification({
        userId: booking.userId,
        type: 'parking_ended',
        title: 'Parking Session Ended',
        message: `Your parking session at ${parkingName} has ended. Total amount: ₹${booking.totalAmount}. Please complete payment.`,
        bookingId: booking._id,
      });

      // Notify host
      await sendNotification({
        userId: booking.ownerId,
        type: 'parking_ended',
        title: 'Parking Session Ended',
        message: `Session for booking ${booking._id} at ${parkingName} has ended. Payment of ₹${booking.totalAmount} pending.`,
        bookingId: booking._id,
      });

      console.log(`[SessionMonitor] Completed session for booking ${booking._id}`);
    }
  } catch (err) {
    console.error('[SessionMonitor] Error running monitor job:', err);
  }
};

/**
 * Initializes timer interval for session monitoring (every 30 seconds)
 */
export const startSessionMonitor = (): NodeJS.Timeout => {
  console.log('[SessionMonitor] Background session monitor started (30s interval).');
  // Run once immediately on start
  runSessionMonitorJob();
  return setInterval(runSessionMonitorJob, 30 * 1000);
};
