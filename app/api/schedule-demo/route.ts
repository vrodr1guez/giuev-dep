import { NextRequest, NextResponse } from 'next/server';
import { DemoScheduleFormSchema, DemoScheduleResponseSchema } from '../../types/forms';
import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/db';
import { generateDemoMeeting } from '../../../lib/meetings';
import { sendDemoConfirmationEmail, sendDemoNotificationEmail } from '../../../lib/email';
import { createRequestLogger, measurePerformance } from '../../../lib/monitoring';
import { requireAuth } from '../../../lib/auth';

// POST /api/schedule-demo
export async function POST(request: NextRequest) {
  const requestLogger = createRequestLogger('Demo');
  const { requestId, complete } = requestLogger(request);

  try {
    const body = await request.json();
    
    // Validate the form data
    const validationResult = DemoScheduleFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      complete(400);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;
    const scheduleId = randomUUID();
    
    // Parse date and time
    const scheduledDate = new Date(formData.date);
    const [time, period] = formData.time.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    scheduledDate.setHours(hour24, minutes || 0, 0, 0);

    // Check for scheduling conflicts
    const hasConflict = await measurePerformance('demo_conflict_check', async () => {
      const existingDemo = await prisma.demoSchedule.findFirst({
        where: {
          scheduledDate,
          scheduledTime: formData.time,
          status: 'scheduled',
        },
      });
      return !!existingDemo;
    });
    
    if (hasConflict) {
      const suggestedTimes = await getSuggestedTimes(formData.date);
      complete(409);
      return NextResponse.json(
        {
          success: false,
          message: 'The selected time slot is no longer available. Please choose a different time.',
          suggestedTimes,
        },
        { status: 409 }
      );
    }

    // Generate meeting link
    let meetingLink: string | null = null;
    try {
      const meeting = await generateDemoMeeting({
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        date: formData.date,
        time: formData.time,
        interests: formData.interests,
      });
      meetingLink = meeting.joinUrl;
    } catch (error) {
      console.warn('Failed to generate meeting link:', error);
      // Continue without meeting link - it can be added later
    }

    // Save to database
    const demoSchedule = await measurePerformance('demo_schedule_save', async () => {
      return await prisma.demoSchedule.create({
        data: {
          id: scheduleId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone || null,
          role: formData.role || null,
          companySize: formData.companySize || null,
          scheduledDate,
          scheduledTime: formData.time,
          interests: formData.interests || [],
          message: formData.message || null,
          status: 'scheduled',
          meetingLink,
          reminderSent: false,
        },
      });
    });

    // Send emails asynchronously
    const emailData = {
      id: scheduleId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      company: formData.company,
      date: formData.date,
      time: formData.time,
      meetingLink: meetingLink || undefined,
    };

    // Send confirmation email to customer (non-blocking)
    sendDemoConfirmationEmail(emailData).catch(error => {
      console.error('Failed to send demo confirmation email:', error);
    });

    // Send notification email to sales team (non-blocking)
    sendDemoNotificationEmail(emailData).catch(error => {
      console.error('Failed to send demo notification email:', error);
    });

    const response = DemoScheduleResponseSchema.parse({
      success: true,
      message: `Demo scheduled successfully for ${formData.date} at ${formData.time}`,
      scheduleId,
      confirmationSent: true,
    });

    complete(201);
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error scheduling demo:', error);
    complete(500, error as Error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'We apologize for the inconvenience. Please try again or contact us directly at sales@giuev.com',
      },
      { status: 500 }
    );
  }
}

// GET /api/schedule-demo - Get available time slots or demo list
export async function GET(request: NextRequest) {
  const requestLogger = createRequestLogger('Demo-Query');
  const { requestId, complete } = requestLogger(request);

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const isAdmin = searchParams.get('admin') === 'true';
    
    if (isAdmin) {
      // Admin endpoint - get demo list
      const authCheck = requireAuth(['read:demos']);
      const authResult = await authCheck(request);
      
      if (!authResult.authenticated) {
        complete(401);
        return NextResponse.json(
          { error: authResult.error || 'Unauthorized' },
          { status: 401 }
        );
      }

      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');
      const offset = (page - 1) * limit;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [demos, total] = await Promise.all([
        prisma.demoSchedule.findMany({
          where,
          orderBy: { scheduledDate: 'asc' },
          take: limit,
          skip: offset,
        }),
        prisma.demoSchedule.count({ where }),
      ]);

      complete(200);
      return NextResponse.json({
        demos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Public endpoint - get available time slots
    if (!date) {
      complete(400);
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const availableSlots = await getAvailableTimeSlots(date);
    
    complete(200);
    return NextResponse.json({
      date,
      availableSlots,
      timezone: 'EST',
    });

  } catch (error) {
    console.error('Error fetching demo data:', error);
    complete(500, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/schedule-demo - Update demo schedule (for admin)
export async function PUT(request: NextRequest) {
  const requestLogger = createRequestLogger('Demo-Update');
  const { requestId, complete } = requestLogger(request);

  try {
    // Check authentication and permissions
    const authCheck = requireAuth(['write:demos']);
    const authResult = await authCheck(request);
    
    if (!authResult.authenticated) {
      complete(401);
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, meetingLink, reminderSent } = body;

    if (!id) {
      complete(400);
      return NextResponse.json(
        { error: 'Demo ID is required' },
        { status: 400 }
      );
    }

    // Update demo schedule
    const updatedDemo = await prisma.demoSchedule.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(meetingLink && { meetingLink }),
        ...(reminderSent !== undefined && { reminderSent }),
        updatedAt: new Date(),
      },
    });

    complete(200);
    return NextResponse.json({
      success: true,
      demo: updatedDemo,
    });

  } catch (error) {
    console.error('Error updating demo schedule:', error);
    complete(500, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getSuggestedTimes(date: string): Promise<string[]> {
  const allTimes = [
    '9:00 AM',
    '10:00 AM', 
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM'
  ];
  
  // Get booked times from database
  const selectedDate = new Date(date);
  const bookedTimes = await prisma.demoSchedule.findMany({
    where: {
      scheduledDate: selectedDate,
      status: 'scheduled',
    },
    select: { scheduledTime: true },
  });

  const bookedTimeStrings = bookedTimes.map(demo => demo.scheduledTime);
  return allTimes.filter(time => !bookedTimeStrings.includes(time));
}

async function getAvailableTimeSlots(date: string): Promise<string[]> {
  const allTimes = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM', 
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM'
  ];
  
  // Check if date is in the past
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return []; // No slots available for past dates
  }

  // Get booked times from database
  const bookedTimes = await prisma.demoSchedule.findMany({
    where: {
      scheduledDate: selectedDate,
      status: 'scheduled',
    },
    select: { scheduledTime: true },
  });

  const bookedTimeStrings = bookedTimes.map(demo => demo.scheduledTime);
  
  // Filter out booked times
  let availableSlots = allTimes.filter(time => !bookedTimeStrings.includes(time));
  
  // If it's today, filter out past times
  if (selectedDate.toDateString() === today.toDateString()) {
    const currentHour = new Date().getHours();
    availableSlots = availableSlots.filter(timeSlot => {
      const [time, period] = timeSlot.split(' ');
      const [hours] = time.split(':').map(Number);
      let hour24 = hours;
      
      if (period === 'PM' && hours !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      return hour24 > currentHour;
    });
  }
  
  return availableSlots;
} 