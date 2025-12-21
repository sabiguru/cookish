import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chefId = params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get dates for next 60 days
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 60);

    // Get chef's recurring availability
    const recurringAvailability = await prisma.recurringAvailability.findMany({
      where: {
        chefId: chefId,
        isActive: true,
        type: 'AVAILABLE',
      },
    });

    // Get one-time availability and unavailability
    const oneTimeAvailability = await prisma.availability.findMany({
      where: {
        chefId: chefId,
        start: {
          gte: today,
          lte: endDate,
        },
      },
    });

    // Get all confirmed/accepted bookings in the date range
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        chefId: chefId,
        date: {
          gte: today,
          lte: endDate,
        },
        status: {
          in: ['CONFIRMED', 'ACCEPTED'],
        },
      },
      select: {
        date: true,
      },
    });

    // Build set of days with recurring availability
    const recurringDays = new Set(
      recurringAvailability.map((a) => a.dayOfWeek)
    );

    // Build map of one-time availability/unavailability
    const oneTimeMap = new Map<string, 'AVAILABLE' | 'UNAVAILABLE' | 'TIME_OFF'>();
    oneTimeAvailability.forEach((slot) => {
      const currentDate = new Date(slot.start);
      while (currentDate <= slot.end) {
        const dateKey = currentDate.toISOString().split('T')[0];
        oneTimeMap.set(dateKey, slot.type);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Build set of fully booked dates
    const bookedDates = new Set<string>();
    confirmedBookings.forEach((booking) => {
      const dateKey = booking.date.toISOString().split('T')[0];
      bookedDates.add(dateKey);
    });

    // Generate available dates
    const availableDates: string[] = [];
    const unavailableDates: string[] = [];
    const currentDate = new Date(today);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      // Check one-time availability/unavailability first
      const oneTimeStatus = oneTimeMap.get(dateKey);

      if (oneTimeStatus === 'UNAVAILABLE' || oneTimeStatus === 'TIME_OFF') {
        unavailableDates.push(dateKey);
      } else if (oneTimeStatus === 'AVAILABLE') {
        // One-time available - check if not fully booked
        if (!bookedDates.has(dateKey)) {
          availableDates.push(dateKey);
        } else {
          unavailableDates.push(dateKey);
        }
      } else if (recurringDays.has(dayOfWeek)) {
        // Recurring availability - check if not fully booked
        if (!bookedDates.has(dateKey)) {
          availableDates.push(dateKey);
        } else {
          unavailableDates.push(dateKey);
        }
      } else {
        unavailableDates.push(dateKey);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      availableDates,
      unavailableDates,
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Available dates fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available dates' },
      { status: 500 }
    );
  }
}
