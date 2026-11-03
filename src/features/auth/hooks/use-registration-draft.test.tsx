import { renderHook, waitFor } from '@testing-library/react-native';

import { createQueryWrapper } from '@tests/helpers/render-with-providers';

import { getRegistrationDraft } from '../api/auth.api';
import type { RegistrationDraft } from '../types/auth.types';

import { useRegistrationDraft } from './use-registration-draft';

jest.mock('../api/auth.api');

const draftFixture: RegistrationDraft = {
  registrationId: 'REG_1',
  country: 'EG',
  phone: '1069004342',
  email: 'driver@example.com',
  otpVerified: true,
  documents: {},
};

describe('useRegistrationDraft', () => {
  it('returns the draft for the given registrationId', async () => {
    jest.mocked(getRegistrationDraft).mockResolvedValue(draftFixture);

    const { result } = await renderHook(() => useRegistrationDraft('REG_1'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(draftFixture);
    expect(getRegistrationDraft).toHaveBeenCalledWith('REG_1');
  });
});
