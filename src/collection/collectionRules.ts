export type VehicleAvailability = 'available' | 'reserved' | 'sold';

export type CollectionVehicle = {
  id: string;
  name: string;
  marque: string;
  year: string;
  category: 'Hypercar' | 'Grand Tourer' | 'Electric Bespoke';
  engine: string;
  speed0to100: string;
  topSpeedKmh: number;
  powerHp: number;
  availability: VehicleAvailability;
  isPrivateVault: boolean;
  publicPriceLabel: string;
  privatePriceUsd?: number;
  chassisNumber?: string;
  assignedAdvisorName: string;
  assignedAdvisorEmail: string;
  image: string;
};

export const FULL_COLLECTION_SOURCE: CollectionVehicle[] = [
  {
    id: 'bugatti-chiron-2024',
    name: 'Bugatti Chiron Pur Sport',
    marque: 'Bugatti',
    year: '2024',
    category: 'Hypercar',
    engine: '8.0L Quad-Turbo W16',
    speed0to100: '2.3s',
    topSpeedKmh: 350,
    powerHp: 1500,
    availability: 'available',
    isPrivateVault: true,
    publicPriceLabel: 'Private Vault — Verified Access Required',
    privatePriceUsd: 3850000,
    chassisNumber: 'VF9-SP-2024-041',
    assignedAdvisorName: 'Julian Vance',
    assignedAdvisorEmail: 'j.vance@veloce.private',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80',
  },
  {
    id: 'rolls-royce-spectre-2024',
    name: 'Rolls-Royce Spectre Black Badge',
    marque: 'Rolls-Royce',
    year: '2024',
    category: 'Electric Bespoke',
    engine: 'Dual-Motor Electric',
    speed0to100: '4.4s',
    topSpeedKmh: 250,
    powerHp: 650,
    availability: 'available',
    isPrivateVault: false,
    publicPriceLabel: '$465,000 USD',
    privatePriceUsd: 465000,
    chassisNumber: 'SCA-RR-2024-118',
    assignedAdvisorName: 'Claire Sterling',
    assignedAdvisorEmail: 'c.sterling@veloce.private',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80',
  },
  {
    id: 'ferrari-sf90-2024',
    name: 'Ferrari SF90 Stradale Assetto Fiorano',
    marque: 'Ferrari',
    year: '2024',
    category: 'Hypercar',
    engine: '4.0L V8 PHEV',
    speed0to100: '2.5s',
    topSpeedKmh: 340,
    powerHp: 986,
    availability: 'available',
    isPrivateVault: false,
    publicPriceLabel: '$625,000 USD',
    privatePriceUsd: 625000,
    chassisNumber: 'ZFF-95-2024-302',
    assignedAdvisorName: 'Matteo Rossi',
    assignedAdvisorEmail: 'm.rossi@veloce.private',
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&q=80',
  },
  {
    id: 'lamborghini-revuelto-2024',
    name: 'Lamborghini Revuelto Opera Unica',
    marque: 'Lamborghini',
    year: '2024',
    category: 'Hypercar',
    engine: '6.5L V12 Hybrid',
    speed0to100: '2.5s',
    topSpeedKmh: 350,
    powerHp: 1001,
    availability: 'reserved',
    isPrivateVault: true,
    publicPriceLabel: 'Private Vault — Verified Access Required',
    privatePriceUsd: 740000,
    chassisNumber: 'ZHW-RV-2024-089',
    assignedAdvisorName: 'Matteo Rossi',
    assignedAdvisorEmail: 'm.rossi@veloce.private',
    image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&q=80',
  },
  {
    id: 'aston-martin-db12-2024',
    name: 'Aston Martin DB12 Volante',
    marque: 'Aston Martin',
    year: '2024',
    category: 'Grand Tourer',
    engine: '4.0L V8 Twin-Turbo',
    speed0to100: '3.5s',
    topSpeedKmh: 325,
    powerHp: 671,
    availability: 'available',
    isPrivateVault: false,
    publicPriceLabel: '$285,000 USD',
    privatePriceUsd: 285000,
    chassisNumber: 'SCF-DB-2024-514',
    assignedAdvisorName: 'Claire Sterling',
    assignedAdvisorEmail: 'c.sterling@veloce.private',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80',
  },
];

export type BuyerInquiryInput = {
  fullName: string;
  email: string;
  phone: string;
  vehicleId: string;
  inquiryType: 'private_viewing' | 'vault_access' | 'acquisition_dossier';
  preferredDate: string;
  city: string;
  notes?: string;
};

export type BuyerInquiryErrors = Partial<Record<keyof BuyerInquiryInput, string>>;

/**
 * Redacts private vault pricing & chassis numbers at the data boundary
 * unless the caller holds verified vault access.
 */
export function projectVehicleForAccess(
  vehicle: CollectionVehicle,
  hasVerifiedVaultAccess: boolean,
): CollectionVehicle {
  if (!vehicle.isPrivateVault || hasVerifiedVaultAccess) {
    return { ...vehicle };
  }
  return {
    ...vehicle,
    privatePriceUsd: undefined,
    chassisNumber: undefined,
  };
}

export function isAppointmentWindowExpired(expiresAt: string, now: Date = new Date()): boolean {
  const exp = new Date(expiresAt).getTime();
  if (Number.isNaN(exp)) return true;
  return now.getTime() > exp;
}

export function validateBuyerInquiry(
  input: BuyerInquiryInput,
  now: Date = new Date(),
): BuyerInquiryErrors {
  const errors: BuyerInquiryErrors = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name (at least 2 characters).';
  }

  const email = String(input.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  const digits = String(input.phone || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    errors.phone = 'Enter a valid contact number (10–15 digits).';
  }

  if (!input.vehicleId || !FULL_COLLECTION_SOURCE.some((v) => v.id === input.vehicleId)) {
    errors.vehicleId = 'Select a valid vehicle from the collection.';
  }

  const today = now.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate)) {
    errors.preferredDate = 'Select a preferred viewing or consultation date.';
  } else if (input.preferredDate < today) {
    errors.preferredDate = 'Preferred date cannot be in the past.';
  }

  if (!input.city || input.city.trim().length < 2) {
    errors.city = 'Enter your city or preferred salon location.';
  }

  return errors;
}
