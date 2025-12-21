import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all availability for a chef
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chef = await prisma.chefProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!chef) {
      return NextResponse.json({ error: 'Chef profile not found' }, { status: 404 });
    }

    // Fetch both one-time and recurring availability
    const [oneTimeAvailability, recurringAvailability] = await Promise.all([
      prisma.availability.findMany({
        where: { chefId: chef.id },
        orderBy: { start: 'asc' },
      }),
      prisma.recurringAvailability.findMany({
        where: { chefId: chef.id, isActive: true },
        orderBy: { dayOfWeek: 'asc' },
      }),
    ]);

    return NextResponse.json({
      oneTime: oneTimeAvailability,
      recurring: recurringAvailability,
    });
  } catch (error) {
    console.error('Availability fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// POST - Create new availability
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chef = await prisma.chefProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!chef) {
      return NextResponse.json({ error: 'Chef profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { type, availabilityType, start, end, note, dayOfWeek, startTime, endTime } = body;

    // type: 'one-time' | 'recurring'
    if (type === 'recurring') {
      // Create recurring availability
      const recurring = await prisma.recurringAvailability.create({
        data: {
          chefId: chef.id,
          dayOfWeek: parseInt(dayOfWeek),
          startTime,
          endTime,
          type: availabilityType || 'AVAILABLE',
          note,
        },
      });

      return NextResponse.json({ success: true, data: recurring }, { status: 201 });
    } else {
      // Create one-time availability
      const availability = await prisma.availability.create({
        data: {
          chefId: chef.id,
          type: availabilityType || 'AVAILABLE',
          start: new Date(start),
          end: new Date(end),
          note,
        },
      });

      return NextResponse.json({ success: true, data: availability }, { status: 201 });
    }
  } catch (error) {
    console.error('Availability creation error:', error);
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 });
  }
}

// DELETE - Delete availability
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chef = await prisma.chefProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!chef) {
      return NextResponse.json({ error: 'Chef profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'one-time' | 'recurring'

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    if (type === 'recurring') {
      // Delete recurring availability
      await prisma.recurringAvailability.delete({
        where: { id, chefId: chef.id },
      });
    } else {
      // Delete one-time availability
      await prisma.availability.delete({
        where: { id, chefId: chef.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Availability deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete availability' }, { status: 500 });
  }
}

// PATCH - Update availability
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chef = await prisma.chefProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!chef) {
      return NextResponse.json({ error: 'Chef profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { id, type, availabilityType, start, end, note, dayOfWeek, startTime, endTime, isActive } = body;

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    if (type === 'recurring') {
      // Update recurring availability
      const updated = await prisma.recurringAvailability.update({
        where: { id, chefId: chef.id },
        data: {
          dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
          startTime,
          endTime,
          type: availabilityType,
          note,
          isActive,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } else {
      // Update one-time availability
      const updated = await prisma.availability.update({
        where: { id, chefId: chef.id },
        data: {
          type: availabilityType,
          start: start ? new Date(start) : undefined,
          end: end ? new Date(end) : undefined,
          note,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error) {
    console.error('Availability update error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
