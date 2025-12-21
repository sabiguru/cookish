import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to check if chef is available
async function checkChefAvailability(
  chefId: string,
  bookingDate: Date,
  dayOfWeek: number
): Promise<boolean> {
  const bookingTime = bookingDate.toTimeString().slice(0, 5); // HH:MM format

  // Check recurring availability for this day of week
  const recurringAvailability = await prisma.recurringAvailability.findFirst({
    where: {
      chefId: chefId,
      dayOfWeek: dayOfWeek,
      isActive: true,
      type: 'AVAILABLE',
    },
  });

  // If there's recurring availability, check if booking time is within the range
  if (recurringAvailability) {
    if (
      bookingTime >= recurringAvailability.startTime &&
      bookingTime <= recurringAvailability.endTime
    ) {
      // Check for one-time unavailability that might override
      const oneTimeUnavailability = await prisma.availability.findFirst({
        where: {
          chefId: chefId,
          type: {
            in: ['UNAVAILABLE', 'TIME_OFF'],
          },
          start: {
            lte: bookingDate,
          },
          end: {
            gte: bookingDate,
          },
        },
      });

      return !oneTimeUnavailability; // Available if no one-time unavailability
    }
  }

  // Check one-time availability for the specific date
  const oneTimeAvailability = await prisma.availability.findFirst({
    where: {
      chefId: chefId,
      type: 'AVAILABLE',
      start: {
        lte: bookingDate,
      },
      end: {
        gte: bookingDate,
      },
    },
  });

  return !!oneTimeAvailability;
}

// POST - Create a new booking
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { chefId, menuId, date, guests, occasion, notes } = body;

    // Validate required fields
    if (!chefId || !menuId || !date || !guests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify chef exists
    const chef = await prisma.chefProfile.findUnique({
      where: { id: chefId },
    });

    if (!chef) {
      return NextResponse.json({ error: 'Chef not found' }, { status: 404 });
    }

    // Verify menu exists and belongs to chef
    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        chefId: chefId,
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found or does not belong to this chef' },
        { status: 404 }
      );
    }

    const bookingDate = new Date(date);
    const bookingDay = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Check chef's availability for the requested date/time
    const isAvailable = await checkChefAvailability(chefId, bookingDate, bookingDay);

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Chef is not available at the requested date and time' },
        { status: 409 }
      );
    }

    // Check for conflicting bookings (only CONFIRMED or ACCEPTED bookings block the slot)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        chefId: chefId,
        date: bookingDate,
        status: {
          in: ['CONFIRMED', 'ACCEPTED'],
        },
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        chefId: chefId,
        menuId: menuId,
        date: new Date(date),
        guests: parseInt(guests),
        occasion: occasion || null,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        chef: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        menu: {
          select: {
            title: true,
            pricePerPerson: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// GET - Fetch bookings for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        chef: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        menu: {
          select: {
            title: true,
            description: true,
            pricePerPerson: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
