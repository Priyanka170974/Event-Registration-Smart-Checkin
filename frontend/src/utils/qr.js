export function parseQrPayload(value) {
  if (typeof value !== 'string') return null;

  const normalized = value.trim();
  if (normalized.startsWith('EVTCHECKIN:')) {
    const parts = normalized.split(':');
    if (parts.length === 3 && parts[1] && parts[2]) {
      return { eventId: parts[1], ticketId: parts[2].toUpperCase() };
    }
  }

  return { eventId: null, ticketId: normalized.toUpperCase() };
}
