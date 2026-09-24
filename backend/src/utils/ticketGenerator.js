import { randomInt } from 'node:crypto';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomCode(length = 7) {
  let code = '';
  for (let index = 0; index < length; index += 1) {
    code += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return code;
}

export function generateTicketId(date = new Date()) {
  return `EVT-${date.getUTCFullYear()}-${randomCode()}`;
}

export function createQrPayload(eventId, ticketId) {
  return `EVTCHECKIN:${eventId}:${ticketId}`;
}

export function parseTicketId(value) {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toUpperCase();
  if (/^EVT-\d{4}-[A-Z2-9]{7}$/.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('EVTCHECKIN:')) {
    const parts = normalized.split(':');
    const ticketId = parts.at(-1);
    return /^EVT-\d{4}-[A-Z2-9]{7}$/.test(ticketId) ? ticketId : null;
  }

  return null;
}
