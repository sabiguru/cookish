import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chefId } = await params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const requestedDate = new Date(dateParam);
    const dayOfWeek = requestedDate.getDay();

    // Get chef's recurring availability for this day
    const recurringAvailability = await prisma.recurringAvailability.findMany({
      where: {
        chefId: chefId,
        dayOfWeek: dayOfWeek,
        isActive: true,
        type: 'AVAILABLE',
      },
    });

    // Get one-time availability/unavailability for this specific date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [oneTimeAvailability, existingBookings] = await Promise.all([
      prisma.availability.findMany({
        where: {
          chefId: chefId,
          start: {
            lte: endOfDay,
          },
          end: {
            gte: startOfDay,
          },
        },
      }),
      // Get confirmed/accepted bookings for this date
      prisma.booking.findMany({
        where: {
          chefId: chefId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ['CONFIRMED', 'ACCEPTED'],
          },
        },
        select: {
          date: true,
        },
      }),
    ]);

    // Generate time slots
    const availableSlots: string[] = [];
    const bookedTimes = new Set(
      existingBookings.map((b) => b.date.toTimeString().slice(0, 5))
    );

    // Check if there's one-time unavailability
    const isUnavailable = oneTimeAvailability.some(
      (a) => a.type === 'UNAVAILABLE' || a.type === 'TIME_OFF'
    );

    if (isUnavailable) {
      return NextResponse.json({ availableSlots: [] });
    }

    // If there are one-time AVAILABLE slots, use those
    const oneTimeAvailable = oneTimeAvailability.filter(
      (a) => a.type === 'AVAILABLE'
    );

    if (oneTimeAvailable.length > 0) {
      // Generate slots from one-time availability
      oneTimeAvailable.forEach((slot) => {
        const startHour = slot.start.getHours();
        const endHour = slot.end.getHours();

        for (let hour = startHour; hour <= endHour; hour++) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          if (!bookedTimes.has(timeSlot)) {
            availableSlots.push(timeSlot);
          }
        }
      });
    } else if (recurringAvailability.length > 0) {
      // Use recurring availability
      recurringAvailability.forEach((slot) => {
        const [startHour] = slot.startTime.split(':').map(Number);
        const [endHour] = slot.endTime.split(':').map(Number);

        for (let hour = startHour; hour <= endHour; hour++) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          if (!bookedTimes.has(timeSlot)) {
            availableSlots.push(timeSlot);
          }
        }
      });
    }

    return NextResponse.json({
      availableSlots: availableSlots.sort(),
      isFullyBooked: availableSlots.length === 0,
    });
  } catch (error) {
    console.error('Available slots fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}
