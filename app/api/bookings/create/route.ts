import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bookingCreateSchema = z.object({
  chefId: z.string(),
  menuId: z.string(),
  date: z.string(),
  guests: z.number().min(1).max(50),
  occasion: z.string().optional(),
  notes: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    postcode: z.string(),
    country: z.string(),
    saveAddress: z.boolean().optional(),
  }),
  payerMap: z.record(z.string(), z.enum(['CHEF', 'USER', 'SPLIT'])),
  paymentMethodId: z.string(),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = bookingCreateSchema.parse(body);

    // Create or find address
    const address = await prisma.address.create({
      data: {
        line1: data.address.street,
        city: data.address.city,
        postalCode: data.address.postcode,
        country: data.address.country,
      },
    });

    // Create venue
    const venue = await prisma.venue.create({
      data: {
        name: 'Customer Venue',
        addressId: address.id,
      },
    });

    // Get menu to calculate price
    const menu = await prisma.menu.findUnique({
      where: { id: data.menuId },
      include: {
        menuItems: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    const menuTotal = menu.pricePerPerson * data.guests;
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        date: new Date(data.date),
        guests: data.guests,
        occasion: data.occasion,
        notes: data.notes,
        status: 'PENDING',
        customerId: session.user.id,
        chefId: data.chefId,
        menuId: data.menuId,
        venueId: venue.id,
      },
    });

    // Create payment record (in production, integrate with Stripe)
    const payment = await prisma.payment.create({
      data: {
        amount: menuTotal,
        currency: 'GBP',
        status: 'COMPLETED',
        method: 'CARD',
        customerId: session.user.id,
        bookingId: booking.id,
        stripePaymentIntentId: data.paymentMethodId,
      },
    });

    // Create procurement items based on payer map
    const procurementItems = [];
    for (const menuItem of menu.menuItems) {
      const payer = data.payerMap[menuItem.item.id] || 'USER';
      
      procurementItems.push({
        bookingId: booking.id,
        ingredientId: menuItem.item.id,
        quantity: 1,
        unit: 'unit',
        status: 'PENDING',
        payingParty: payer,
      });
    }

    if (procurementItems.length > 0) {
      await prisma.procurement.createMany({
        data: procurementItems,
      });
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: 'BOOKING_CREATED',
        description: `New booking created for ${menu.title}`,
        userId: session.user.id,
        bookingId: booking.id,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
