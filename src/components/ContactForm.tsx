'use client';

import React, { useState } from 'react';
import { ContactFormData, ContactFormResponse } from '@/lib/types';

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setStatusMessage(null);

    // Basic client validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data: ContactFormResponse = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatusMessage({ type: 'danger', text: data.message || 'Validation failed. Please review errors.' });
        if (data.errors) {
          setFieldErrors(data.errors);
        }
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Network communication error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      {statusMessage && (
        <div className={`alert alert-${statusMessage.type}`} role="alert" id="contact-alert">
          <span>{statusMessage.type === 'success' ? '✓' : '⚠'}</span>
          <div>{statusMessage.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="contact-name" className="form-label">
            Your Full Name *
          </label>
          <input
            type="text"
            id="contact-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Jane Doe"
            required
            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
          />
          {fieldErrors.name && (
            <p id="name-error" className="form-error">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contact-email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="contact-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="jane@example.com"
            required
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="form-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contact-subject" className="form-label">
            Subject *
          </label>
          <input
            type="text"
            id="contact-subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="form-input"
            placeholder="Inquiry regarding BLFA Architecture"
            required
            aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
          />
          {fieldErrors.subject && (
            <p id="subject-error" className="form-error">
              {fieldErrors.subject}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contact-message" className="form-label">
            Message *
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Write your message here (min. 10 characters)..."
            required
            aria-describedby={fieldErrors.message ? 'message-error' : undefined}
          />
          {fieldErrors.message && (
            <p id="message-error" className="form-error">
              {fieldErrors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          id="contact-submit-btn"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Validating & Sending...' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
}
