import type { Enquiry, NotificationPayload } from './contracts.ts';
import { normalizeEmailAddress, validateEnquiry } from './validation.ts';

export function createNotificationPayload(
  enquiry: Enquiry,
  configuration: { from: string; to: string },
): NotificationPayload {
  const checked = validateEnquiry(enquiry);
  if (!checked.ok) throw new Error('Cannot create a notification for an invalid enquiry.');
  const from = normalizeEmailAddress(configuration?.from);
  const to = normalizeEmailAddress(configuration?.to);
  if (!from || !to) throw new Error('Configure valid bare sender and recipient email addresses.');
  const value = checked.value;
  const story = value.story === 'wedding-story' ? 'Wedding story' : value.story === 'couple-session' ? 'Couple session' : value.story || 'Not selected';
  return Object.freeze({
    from, to, subject: 'New website enquiry', replyTo: value.email,
    text: [
      'New website enquiry', '',
      `Name: ${value.name}`, `Email: ${value.email}`,
      `When: ${value.when || 'Not provided'}`, `Where: ${value.where || 'Not provided'}`,
      `Story: ${story}`, '', 'Message:', value.message || 'No message provided.',
    ].join('\n'),
  });
}
