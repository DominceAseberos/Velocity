import {
  FULL_COLLECTION_SOURCE,
  isAppointmentWindowExpired,
  projectVehicleForAccess,
  validateBuyerInquiry,
  type BuyerInquiryErrors,
  type BuyerInquiryInput,
  type CollectionVehicle,
  type VehicleAvailability,
} from './collectionRules';

export type InquiryStatus =
  | 'pending_review'
  | 'access_granted'
  | 'appointment_proposed'
  | 'appointment_confirmed'
  | 'cancelled';

export type BuyerInquiryRecord = {
  id: string;
  accessToken: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleId: string;
  vehicleName: string;
  inquiryType: BuyerInquiryInput['inquiryType'];
  preferredDate: string;
  city: string;
  notes?: string;
  assignedAdvisorName: string;
  assignedAdvisorEmail: string;
  status: InquiryStatus;
  vaultAccessUnlocked: boolean;
  proposedSlot?: string;
  appointmentExpiresAt?: string;
  createdAt: string;
  isDemoSeed?: boolean;
};

export type GatewayErrorCode =
  | 'VALIDATION_ERROR'
  | 'VEHICLE_UNAVAILABLE'
  | 'DUPLICATE_LEAD'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'APPOINTMENT_EXPIRED'
  | 'POLICY_VIOLATION'
  | 'STORAGE_ERROR';

export type GatewayResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: GatewayErrorCode; message: string; fieldErrors?: BuyerInquiryErrors };

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const INQUIRIES_KEY = 'velocity-inquiries-v2';
const INVENTORY_OVERRIDES_KEY = 'velocity-inventory-overrides-v2';
const SEED_OVERRIDES_KEY = 'velocity-seed-overrides-v2';
const IDEMPOTENCY_KEY = 'velocity-idempotency-v2';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
}

function defaultStorage(): StorageLike {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return createMemoryStorage();
}

function generateToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  }
  return Math.random().toString(36).slice(2, 14);
}

export function createSeededBuyerInquiries(now: Date = new Date()): BuyerInquiryRecord[] {
  const futureExp = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: 'VLC-DEMO-001',
      accessToken: 'demo-token-001',
      fullName: 'Alexander Sterling',
      email: 'alex.sterling@example.com',
      phone: '+1 212 555 0194',
      vehicleId: 'bugatti-chiron-2024',
      vehicleName: 'Bugatti Chiron Pur Sport',
      inquiryType: 'vault_access',
      preferredDate: '2027-02-15',
      city: 'Geneva / Zurich',
      notes: 'Interested in private vault inspection and chassis provenance.',
      assignedAdvisorName: 'Julian Vance',
      assignedAdvisorEmail: 'j.vance@veloce.private',
      status: 'appointment_proposed',
      vaultAccessUnlocked: true,
      proposedSlot: '2027-02-15 · 14:00 CET Private Salon',
      appointmentExpiresAt: futureExp,
      createdAt: now.toISOString(),
      isDemoSeed: true,
    },
  ];
}

export class LocalCollectionGateway {
  private readonly storage: StorageLike;
  private readonly nowProvider: () => Date;

  constructor(storage: StorageLike = defaultStorage(), nowProvider: () => Date = () => new Date()) {
    this.storage = storage;
    this.nowProvider = nowProvider;
  }

  private readInventoryOverrides(): Record<string, VehicleAvailability> {
    try {
      const raw = this.storage.getItem(INVENTORY_OVERRIDES_KEY);
      return raw ? (JSON.parse(raw) as Record<string, VehicleAvailability>) : {};
    } catch {
      return {};
    }
  }

  private writeInventoryOverrides(map: Record<string, VehicleAvailability>): void {
    this.storage.setItem(INVENTORY_OVERRIDES_KEY, JSON.stringify(map));
  }

  private readCustomInquiries(): BuyerInquiryRecord[] {
    try {
      const raw = this.storage.getItem(INQUIRIES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as BuyerInquiryRecord[]) : [];
    } catch {
      return [];
    }
  }

  private writeCustomInquiries(list: BuyerInquiryRecord[]): void {
    this.storage.setItem(INQUIRIES_KEY, JSON.stringify(list));
  }

  private readSeedOverrides(): Record<string, Partial<BuyerInquiryRecord>> {
    try {
      const raw = this.storage.getItem(SEED_OVERRIDES_KEY);
      return raw ? (JSON.parse(raw) as Record<string, Partial<BuyerInquiryRecord>>) : {};
    } catch {
      return {};
    }
  }

  private writeSeedOverrides(map: Record<string, Partial<BuyerInquiryRecord>>): void {
    this.storage.setItem(SEED_OVERRIDES_KEY, JSON.stringify(map));
  }

  private readIdempotency(): Record<string, string> {
    try {
      const raw = this.storage.getItem(IDEMPOTENCY_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  }

  private writeIdempotency(map: Record<string, string>): void {
    this.storage.setItem(IDEMPOTENCY_KEY, JSON.stringify(map));
  }

  private rawInventorySync(): CollectionVehicle[] {
    const overrides = this.readInventoryOverrides();
    return FULL_COLLECTION_SOURCE.map((v) => ({
      ...v,
      availability: overrides[v.id] || v.availability,
    }));
  }

  private allInquiriesSync(): BuyerInquiryRecord[] {
    const custom = this.readCustomInquiries();
    const overrides = this.readSeedOverrides();
    const seeds = createSeededBuyerInquiries(this.nowProvider()).map((s) => ({
      ...s,
      ...(overrides[s.id] || {}),
      isDemoSeed: true,
    }));
    return [...custom, ...seeds];
  }

  async listInventory(options: { accessToken?: string; staffMode?: boolean } = {}): Promise<CollectionVehicle[]> {
    const raw = this.rawInventorySync();
    let unlocked = Boolean(options.staffMode);
    if (!unlocked && options.accessToken) {
      const match = this.allInquiriesSync().find(
        (inq) => inq.accessToken === options.accessToken && inq.vaultAccessUnlocked,
      );
      unlocked = Boolean(match);
    }
    return raw.map((v) => projectVehicleForAccess(v, unlocked));
  }

  async updateVehicleAvailability(
    vehicleId: string,
    availability: VehicleAvailability,
  ): Promise<GatewayResult<CollectionVehicle>> {
    const raw = this.rawInventorySync();
    const found = raw.find((v) => v.id === vehicleId);
    if (!found) {
      return { ok: false, code: 'NOT_FOUND', message: 'Vehicle not found in dealer inventory.' };
    }
    const overrides = this.readInventoryOverrides();
    overrides[vehicleId] = availability;
    this.writeInventoryOverrides(overrides);
    return { ok: true, data: { ...found, availability } };
  }

  async listInquiries(): Promise<BuyerInquiryRecord[]> {
    return this.allInquiriesSync();
  }

  async getInquiry(id: string, token?: string): Promise<GatewayResult<BuyerInquiryRecord>> {
    const found = this.allInquiriesSync().find((i) => i.id.toUpperCase() === id.trim().toUpperCase());
    if (!found) {
      return { ok: false, code: 'NOT_FOUND', message: 'Buyer inquiry reference not found.' };
    }
    if (token !== undefined && found.accessToken !== token.trim()) {
      return { ok: false, code: 'FORBIDDEN', message: 'Invalid access token for this dossier.' };
    }
    return { ok: true, data: found };
  }

  async createInquiry(
    input: BuyerInquiryInput,
    idempotencyKey: string,
  ): Promise<GatewayResult<BuyerInquiryRecord>> {
    const idemp = this.readIdempotency();
    if (idempotencyKey && idemp[idempotencyKey]) {
      const existing = this.allInquiriesSync().find((i) => i.id === idemp[idempotencyKey]);
      if (existing) return { ok: true, data: existing };
    }

    const now = this.nowProvider();
    const fieldErrors = validateBuyerInquiry(input, now);
    if (Object.keys(fieldErrors).length > 0) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        message: 'Please correct the highlighted fields.',
        fieldErrors,
      };
    }

    const vehicle = this.rawInventorySync().find((v) => v.id === input.vehicleId);
    if (!vehicle) {
      return { ok: false, code: 'NOT_FOUND', message: 'Selected vehicle is no longer in inventory.' };
    }
    if (vehicle.availability === 'sold') {
      return {
        ok: false,
        code: 'VEHICLE_UNAVAILABLE',
        message: `${vehicle.name} has already been acquired. Please select another vehicle from the collection.`,
      };
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    const duplicate = this.allInquiriesSync().find(
      (i) =>
        i.email === normalizedEmail &&
        i.vehicleId === vehicle.id &&
        i.status !== 'cancelled',
    );
    if (duplicate) {
      return {
        ok: false,
        code: 'DUPLICATE_LEAD',
        message: `An active inquiry (${duplicate.id}) already exists for your email on ${vehicle.name}.`,
      };
    }

    const initials =
      input.fullName
        .trim()
        .replace(/[^a-z0-9]/gi, '')
        .slice(0, 3)
        .toUpperCase() || 'VIP';
    const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
    const id = `VLC-${input.preferredDate.replaceAll('-', '').slice(2)}-${initials}${suffix}`;

    const record: BuyerInquiryRecord = {
      id,
      accessToken: generateToken(),
      fullName: input.fullName.trim(),
      email: normalizedEmail,
      phone: input.phone.trim(),
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      inquiryType: input.inquiryType,
      preferredDate: input.preferredDate,
      city: input.city.trim(),
      notes: input.notes?.trim() || undefined,
      assignedAdvisorName: vehicle.assignedAdvisorName,
      assignedAdvisorEmail: vehicle.assignedAdvisorEmail,
      status: 'pending_review',
      vaultAccessUnlocked: false,
      createdAt: now.toISOString(),
      isDemoSeed: false,
    };

    try {
      const custom = this.readCustomInquiries();
      this.writeCustomInquiries([record, ...custom]);
      if (idempotencyKey) {
        idemp[idempotencyKey] = record.id;
        this.writeIdempotency(idemp);
      }
      return { ok: true, data: record };
    } catch {
      return {
        ok: false,
        code: 'STORAGE_ERROR',
        message: 'Unable to store your inquiry locally.',
      };
    }
  }

  async grantVaultAccessAndProposeViewing(
    id: string,
    proposal: { proposedSlot: string; expiresAt?: string; unlockVault?: boolean },
  ): Promise<GatewayResult<BuyerInquiryRecord>> {
    const found = await this.getInquiry(id);
    if (!found.ok) return found;
    const inquiry = found.data;

    if (inquiry.status === 'cancelled') {
      return { ok: false, code: 'POLICY_VIOLATION', message: 'Cannot schedule a cancelled inquiry.' };
    }

    const now = this.nowProvider();
    const expiresAt =
      proposal.expiresAt || new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const updated: BuyerInquiryRecord = {
      ...inquiry,
      status: 'appointment_proposed',
      vaultAccessUnlocked: proposal.unlockVault ?? true,
      proposedSlot: proposal.proposedSlot.trim(),
      appointmentExpiresAt: expiresAt,
    };

    return this.persistUpdated(updated);
  }

  async confirmViewingAppointment(id: string, token: string): Promise<GatewayResult<BuyerInquiryRecord>> {
    const found = await this.getInquiry(id, token);
    if (!found.ok) return found;
    const inquiry = found.data;

    if (inquiry.status !== 'appointment_proposed' || !inquiry.appointmentExpiresAt) {
      return {
        ok: false,
        code: 'POLICY_VIOLATION',
        message: 'No proposed viewing window is pending confirmation.',
      };
    }

    const vehicle = this.rawInventorySync().find((v) => v.id === inquiry.vehicleId);
    if (!vehicle || vehicle.availability === 'sold') {
      return {
        ok: false,
        code: 'VEHICLE_UNAVAILABLE',
        message: 'This vehicle was sold prior to appointment confirmation.',
      };
    }

    if (isAppointmentWindowExpired(inquiry.appointmentExpiresAt, this.nowProvider())) {
      return {
        ok: false,
        code: 'APPOINTMENT_EXPIRED',
        message: `Viewing invitation expired on ${inquiry.appointmentExpiresAt.slice(0, 10)}. Please contact ${inquiry.assignedAdvisorName} for a new window.`,
      };
    }

    const updated: BuyerInquiryRecord = {
      ...inquiry,
      status: 'appointment_confirmed',
    };

    return this.persistUpdated(updated);
  }

  async cancelInquiry(
    id: string,
    options: { token?: string; actor?: 'customer' | 'staff' } = {},
  ): Promise<GatewayResult<BuyerInquiryRecord>> {
    const found = await this.getInquiry(id, options.actor === 'staff' ? undefined : options.token);
    if (!found.ok) return found;

    const updated: BuyerInquiryRecord = {
      ...found.data,
      status: 'cancelled',
    };

    return this.persistUpdated(updated);
  }

  private persistUpdated(updated: BuyerInquiryRecord): GatewayResult<BuyerInquiryRecord> {
    try {
      if (updated.isDemoSeed) {
        const overrides = this.readSeedOverrides();
        overrides[updated.id] = {
          status: updated.status,
          vaultAccessUnlocked: updated.vaultAccessUnlocked,
          proposedSlot: updated.proposedSlot,
          appointmentExpiresAt: updated.appointmentExpiresAt,
        };
        this.writeSeedOverrides(overrides);
      } else {
        const custom = this.readCustomInquiries().map((i) => (i.id === updated.id ? updated : i));
        this.writeCustomInquiries(custom);
      }
      return { ok: true, data: updated };
    } catch {
      return { ok: false, code: 'STORAGE_ERROR', message: 'Failed to update inquiry record.' };
    }
  }
}

export const collectionGateway = new LocalCollectionGateway();
