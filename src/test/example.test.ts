import { describe, it, expect } from 'vitest';
import {
  FULL_COLLECTION_SOURCE,
  projectVehicleForAccess,
  validateBuyerInquiry,
} from '../collection/collectionRules';
import { LocalCollectionGateway, type StorageLike } from '../collection/collectionGateway';

function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
}

const FIXED_NOW = new Date('2027-01-10T00:00:00.000Z');

describe('collectionRules', () => {
  it('redacts private vault pricing and chassis number unless vault access is verified', () => {
    const chiron = FULL_COLLECTION_SOURCE.find((v) => v.id === 'bugatti-chiron-2024')!;
    const publicView = projectVehicleForAccess(chiron, false);
    expect(publicView.privatePriceUsd).toBeUndefined();
    expect(publicView.chassisNumber).toBeUndefined();

    const verifiedView = projectVehicleForAccess(chiron, true);
    expect(verifiedView.privatePriceUsd).toBe(3850000);
    expect(verifiedView.chassisNumber).toBe('VF9-SP-2024-041');
  });

  it('validates buyer inquiry inputs and rejects past viewing dates', () => {
    const errors = validateBuyerInquiry(
      {
        fullName: 'A',
        email: 'bad-email',
        phone: '123',
        vehicleId: 'nonexistent',
        inquiryType: 'private_viewing',
        preferredDate: '2026-01-01',
        city: '',
      },
      FIXED_NOW,
    );
    expect(errors.fullName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.vehicleId).toBeTruthy();
    expect(errors.preferredDate).toBeTruthy();
    expect(errors.city).toBeTruthy();
  });
});

describe('LocalCollectionGateway', () => {
  it('enforces idempotency, rejects duplicate leads, rejects sold vehicles, and enforces viewing window expiry', async () => {
    const gw = new LocalCollectionGateway(memoryStorage(), () => FIXED_NOW);
    const input = {
      fullName: 'Victoria Sterling',
      email: 'victoria@example.com',
      phone: '+41225550199',
      vehicleId: 'bugatti-chiron-2024',
      inquiryType: 'vault_access' as const,
      preferredDate: '2027-02-20',
      city: 'Geneva',
      notes: 'Requesting chassis dossier and private salon viewing.',
    };

    const created = await gw.createInquiry(input, 'idem-vlc-1');
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.data.assignedAdvisorName).toBe('Julian Vance');

    // Idempotent retry
    const retry = await gw.createInquiry(input, 'idem-vlc-1');
    expect(retry.ok).toBe(true);
    if (retry.ok) expect(retry.data.id).toBe(created.data.id);

    // Duplicate lead with different idempotency key for same email + vehicle
    const dup = await gw.createInquiry(input, 'idem-vlc-2');
    expect(dup.ok).toBe(false);
    if (!dup.ok) expect(dup.code).toBe('DUPLICATE_LEAD');

    // Before vault access is unlocked, inventory projection hides privatePriceUsd
    const beforeUnlock = await gw.listInventory({ accessToken: created.data.accessToken });
    expect(beforeUnlock.find((v) => v.id === 'bugatti-chiron-2024')?.privatePriceUsd).toBeUndefined();

    // Advisor unlocks vault access with an already-expired viewing window
    await gw.grantVaultAccessAndProposeViewing(created.data.id, {
      proposedSlot: '2027-01-05 · 10:00 CET',
      expiresAt: '2027-01-05T00:00:00.000Z',
      unlockVault: true,
    });

    // After unlock, verified token reveals private vault pricing
    const afterUnlock = await gw.listInventory({ accessToken: created.data.accessToken });
    expect(afterUnlock.find((v) => v.id === 'bugatti-chiron-2024')?.privatePriceUsd).toBe(3850000);

    // Expired appointment confirmation is rejected
    const expConfirm = await gw.confirmViewingAppointment(created.data.id, created.data.accessToken);
    expect(expConfirm.ok).toBe(false);
    if (!expConfirm.ok) expect(expConfirm.code).toBe('APPOINTMENT_EXPIRED');

    // Advisor proposes a valid future slot
    await gw.grantVaultAccessAndProposeViewing(created.data.id, {
      proposedSlot: '2027-02-20 · 15:00 CET Geneva Salon',
      expiresAt: '2027-02-19T00:00:00.000Z',
      unlockVault: true,
    });

    const validConfirm = await gw.confirmViewingAppointment(created.data.id, created.data.accessToken);
    expect(validConfirm.ok).toBe(true);
    if (validConfirm.ok) expect(validConfirm.data.status).toBe('appointment_confirmed');

    // Mark Ferrari SF90 as sold -> new inquiry on sold vehicle is rejected with VEHICLE_UNAVAILABLE
    await gw.updateVehicleAvailability('ferrari-sf90-2024', 'sold');
    const soldAttempt = await gw.createInquiry(
      {
        ...input,
        email: 'newbuyer@example.com',
        vehicleId: 'ferrari-sf90-2024',
      },
      'idem-vlc-3',
    );
    expect(soldAttempt.ok).toBe(false);
    if (!soldAttempt.ok) expect(soldAttempt.code).toBe('VEHICLE_UNAVAILABLE');
  });
});
