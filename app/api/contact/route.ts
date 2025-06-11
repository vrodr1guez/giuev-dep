import { NextRequest, NextResponse } from 'next/server';
import { ContactFormSchema, ContactSubmissionResponseSchema } from '../../types/forms';
import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/db';
import { sendContactConfirmationEmail, sendContactNotificationEmail } from '../../../lib/email';
import { createRequestLogger, measurePerformance } from '../../../lib/monitoring';
import { requireAuth } from '../../../lib/auth';

// POST /api/contact
export async function POST(request: NextRequest) {
  const requestLogger = createRequestLogger('Contact');
  const { requestId, complete } = requestLogger(request);

  try {
    const body = await request.json();
    
    // Validate the form data
    const validationResult = ContactFormSchema.safeParse(body);
    
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
    const submissionId = randomUUID();
    
    // Save to database with performance monitoring
    const contactSubmission = await measurePerformance('contact_submission_save', async () => {
      return await prisma.contactSubmission.create({
        data: {
          id: submissionId,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: formData.role || null,
          phone: formData.phone || null,
          message: formData.message,
          inquiryType: formData.inquiryType,
          status: 'pending',
        },
      });
    });

    // Send emails asynchronously
    const emailData = {
      id: submissionId,
      name: formData.name,
      email: formData.email,
      company: formData.company,
      message: formData.message,
      inquiryType: formData.inquiryType,
    };

    // Send confirmation email to customer (non-blocking)
    sendContactConfirmationEmail(emailData).catch(error => {
      console.error('Failed to send confirmation email:', error);
    });

    // Send notification email to sales team (non-blocking)
    sendContactNotificationEmail(emailData).catch(error => {
      console.error('Failed to send notification email:', error);
    });

    const response = ContactSubmissionResponseSchema.parse({
      success: true,
      message: 'Thank you for your inquiry! Our team will respond within 2 business hours.',
      submissionId,
      estimatedResponseTime: '2 business hours'
    });

    complete(201);
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error processing contact form:', error);
    complete(500, error as Error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'We apologize for the inconvenience. Please try again or contact us directly at info@giuev.com',
      },
      { status: 500 }
    );
  }
}

// GET /api/contact - Get contact submissions (for admin)
export async function GET(request: NextRequest) {
  const requestLogger = createRequestLogger('Contact-Admin');
  const { requestId, complete } = requestLogger(request);

  try {
    // Check authentication and permissions
    const authCheck = requireAuth(['read:contacts']);
    const authResult = await authCheck(request);
    
    if (!authResult.authenticated) {
      complete(401);
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch submissions with pagination
    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          role: true,
          phone: true,
          inquiryType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          assignedTo: true,
          responseTime: true,
        },
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    complete(200);
    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        status,
      },
    });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    complete(500, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/contact - Update contact submission (for admin)
export async function PUT(request: NextRequest) {
  const requestLogger = createRequestLogger('Contact-Update');
  const { requestId, complete } = requestLogger(request);

  try {
    // Check authentication and permissions
    const authCheck = requireAuth(['write:contacts']);
    const authResult = await authCheck(request);
    
    if (!authResult.authenticated) {
      complete(401);
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, assignedTo, responseTime } = body;

    if (!id) {
      complete(400);
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Update submission
    const updatedSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedTo && { assignedTo }),
        ...(responseTime && { responseTime: new Date(responseTime) }),
        updatedAt: new Date(),
      },
    });

    complete(200);
    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });

  } catch (error) {
    console.error('Error updating contact submission:', error);
    complete(500, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 