import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData, ContactFormResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body: Partial<ContactFormData> = await req.json();
    const errors: Record<string, string> = {};

    // Validate Name
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    } else if (body.name.trim().length > 100) {
      errors.name = 'Full name cannot exceed 100 characters.';
    }

    // Validate Email
    if (!body.email || typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    // Validate Subject
    if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters.';
    } else if (body.subject.trim().length > 150) {
      errors.subject = 'Subject cannot exceed 150 characters.';
    }

    // Validate Message
    if (!body.message || typeof body.message !== 'string' || body.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long.';
    } else if (body.message.trim().length > 2000) {
      errors.message = 'Message cannot exceed 2000 characters.';
    }

    // If there are validation errors, return 400 Bad Request
    if (Object.keys(errors).length > 0) {
      const responsePayload: ContactFormResponse = {
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors,
      };
      return NextResponse.json(responsePayload, { status: 400 });
    }

    // In a production backend, this would forward to an email gateway or CRM
    const responsePayload: ContactFormResponse = {
      success: true,
      message: `Thank you, ${body.name?.trim()}! Your message has been received and validated successfully.`,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid payload or server error processing contact submission.',
      },
      { status: 400 }
    );
  }
}
