import {
  EMPTY_VEHICLE_FORM,
  isValidVin,
  isVehicleFormComplete,
  normalizeVin,
  toNewVehicle,
  type VehicleForm,
} from './vehicle-form';

const VIN = '1HGCM82633A004352';
const COMPLETE: VehicleForm = {
  licensePlate: ' F-OP 2024 ',
  vin: VIN.toLowerCase(),
  make: 'Opel',
  model: 'Astra',
  year: 2022,
  fuelType: 'hybrid',
};

describe('isValidVin', () => {
  it('accepts 17 letters and digits, in any case', () => {
    expect(isValidVin(VIN)).toBe(true);
    expect(isValidVin(VIN.toLowerCase())).toBe(true);
  });

  it.each([
    ['too short', VIN.slice(0, 16)],
    ['too long', `${VIN}1`],
    ['contains I', `I${VIN.slice(1)}`],
    ['contains O', `O${VIN.slice(1)}`],
    ['contains Q', `Q${VIN.slice(1)}`],
    ['has a symbol', `-${VIN.slice(1)}`],
    ['empty', ''],
  ])('rejects a VIN that is %s', (_name, vin) => {
    expect(isValidVin(vin)).toBe(false);
  });

  it('ignores spaces and upper-cases when normalizing', () => {
    expect(normalizeVin(' 1hg cm826 33a004352 ')).toBe(VIN);
  });
});

describe('vehicle form', () => {
  it('is incomplete until every field is filled', () => {
    expect(isVehicleFormComplete(EMPTY_VEHICLE_FORM)).toBe(false);
    expect(isVehicleFormComplete(COMPLETE)).toBe(true);
    for (const missing of ['licensePlate', 'vin', 'make', 'model', 'year', 'fuelType'] as const) {
      const form = { ...COMPLETE, [missing]: EMPTY_VEHICLE_FORM[missing] };
      expect(isVehicleFormComplete(form)).toBe(false);
    }
  });

  it('builds a trimmed, normalized request body', () => {
    expect(toNewVehicle(COMPLETE)).toEqual({
      licensePlate: 'F-OP 2024',
      vin: VIN,
      make: 'Opel',
      model: 'Astra',
      year: 2022,
      fuelType: 'hybrid',
    });
  });

  it('builds nothing while incomplete', () => {
    expect(toNewVehicle(EMPTY_VEHICLE_FORM)).toBeNull();
  });
});
