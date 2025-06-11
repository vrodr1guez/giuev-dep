import { z } from 'zod';

// Contact Form Schema
export const ContactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters'),
  role: z.string()
    .max(100, 'Role must be less than 100 characters')
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  inquiryType: z.enum([
    'general',
    'enterprise', 
    'partnership',
    'support',
    'media',
    'careers'
  ]).default('general'),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Demo Scheduling Form Schema
export const DemoScheduleFormSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters'),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  role: z.enum([
    'Executive',
    'Manager', 
    'Operations',
    'IT',
    'Sustainability',
    'Other'
  ]).optional(),
  companySize: z.enum([
    '1-10',
    '11-50',
    '51-200', 
    '201-500',
    '501+'
  ]).optional(),
  date: z.string()
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Please select a future date'),
  time: z.enum([
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM'
  ]),
  interests: z.array(z.string()).optional().default([]),
  message: z.string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

export type DemoScheduleFormData = z.infer<typeof DemoScheduleFormSchema>;

// Response Schemas
export const ContactSubmissionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  submissionId: z.string().optional(),
  estimatedResponseTime: z.string().optional(),
});

export const DemoScheduleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  scheduleId: z.string().optional(),
  confirmationSent: z.boolean().optional(),
});

export type ContactSubmissionResponse = z.infer<typeof ContactSubmissionResponseSchema>;
export type DemoScheduleResponse = z.infer<typeof DemoScheduleResponseSchema>;

// Database Models
export const ContactSubmissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  company: z.string(),
  role: z.string().nullable(),
  phone: z.string().nullable(),
  message: z.string(),
  inquiryType: z.string(),
  status: z.enum(['pending', 'responded', 'closed']).default('pending'),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignedTo: z.string().nullable(),
  responseTime: z.date().nullable(),
});

export const DemoScheduleSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  company: z.string(),
  phone: z.string().nullable(),
  role: z.string().nullable(),
  companySize: z.string().nullable(),
  scheduledDate: z.date(),
  scheduledTime: z.string(),
  interests: z.array(z.string()),
  message: z.string().nullable(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']).default('scheduled'),
  createdAt: z.date(),
  updatedAt: z.date(),
  meetingLink: z.string().nullable(),
  reminderSent: z.boolean().default(false),
});

export type ContactSubmission = z.infer<typeof ContactSubmissionSchema>;
export type DemoSchedule = z.infer<typeof DemoScheduleSchema>; 