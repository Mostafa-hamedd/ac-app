/** Formats an "HH:mm" slot as a time in the app's language. */
export function formatSlot(slot: string, locale: string): string {
  const [hours, minutes] = slot.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
