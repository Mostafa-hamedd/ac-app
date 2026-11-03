import { parseAppLink } from './linking-config';

// Jest hoists this above the import.
jest.mock('@/config/env', () => ({ env: { linkDomain: 'app.example.com' } }));

describe('parseAppLink', () => {
  it.each([
    ['/requests/REQ_123', '/requests/REQ_123', 'request'],
    ['autoconnect://payments/PAY_456', '/payments/PAY_456', 'payment'],
    ['https://app.example.com/notifications/NOTIF_789', '/notifications/NOTIF_789', 'notification'],
    ['/vehicles/abc-1?ref=push', '/vehicles/abc-1', 'vehicle'],
  ])('accepts %s', (input, href, type) => {
    expect(parseAppLink(input)).toMatchObject({ href, type });
  });

  it.each([
    ['unknown route', '/admin/123'],
    ['missing id', '/requests'],
    ['extra segments', '/requests/1/edit'],
    ['path traversal', '/requests/..%2F..%2Fadmin'],
    ['bad characters', '/requests/<script>'],
    ['foreign domain', 'https://evil.example.org/requests/1'],
    ['plain http', 'http://app.example.com/requests/1'],
    ['non-string', 42],
    ['over-long id', `/requests/${'a'.repeat(65)}`],
  ])('rejects %s', (_label, input) => {
    expect(parseAppLink(input)).toBeNull();
  });
});
