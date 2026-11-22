import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collectionGateway,
  type BuyerInquiryRecord,
} from "@/collection/collectionGateway";
import type { CollectionVehicle, VehicleAvailability } from "@/collection/collectionRules";

const ConciergeDesk = () => {
  const [inquiries, setInquiries] = useState<BuyerInquiryRecord[]>([]);
  const [inventory, setInventory] = useState<CollectionVehicle[]>([]);
  const [showSeeds, setShowSeeds] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<BuyerInquiryRecord | null>(null);
  const [proposedSlot, setProposedSlot] = useState("2027-02-22 · 15:00 CET Private Salon");
  const [feedback, setFeedback] = useState("");

  const reload = async () => {
    const [inqList, invList] = await Promise.all([
      collectionGateway.listInquiries(),
      collectionGateway.listInventory({ staffMode: true }),
    ]);
    setInquiries(inqList);
    setInventory(invList);
  };

  useEffect(() => {
    let active = true;
    void Promise.all([
      collectionGateway.listInquiries(),
      collectionGateway.listInventory({ staffMode: true }),
    ]).then(([inqList, invList]) => {
      if (!active) return;
      setInquiries(inqList);
      setInventory(invList);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleProposeViewing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    const res = await collectionGateway.grantVaultAccessAndProposeViewing(selectedInquiry.id, {
      proposedSlot,
      unlockVault: true,
    });
    if (!res.ok) {
      setFeedback(res.message);
      return;
    }
    setSelectedInquiry(null);
    await reload();
    setFeedback(`Unlocked Vault Access & proposed viewing for ${res.data.fullName}.`);
  };

  const handleAvailabilityChange = async (
    vehicleId: string,
    availability: VehicleAvailability,
  ) => {
    const res = await collectionGateway.updateVehicleAvailability(vehicleId, availability);
    if (res.ok) {
      await reload();
      setFeedback(`Updated ${res.data.name} inventory status to ${availability.toUpperCase()}.`);
    }
  };

  const visibleInquiries = inquiries.filter((i) => showSeeds || !i.isDemoSeed);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono-ui text-xs">
      <header className="border-b border-gold/15 px-6 py-5 flex items-center justify-between">
        <div>
          <Link to="/" className="font-display text-2xl tracking-[0.3em] text-foreground">
            VELOCE
          </Link>
          <span className="ml-4 text-gold uppercase tracking-widest">
            Concierge &amp; Inventory Desk
          </span>
        </div>
        <div className="flex items-center gap-6 uppercase">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSeeds}
              onChange={(e) => setShowSeeds(e.target.checked)}
            />
            <span>Show demo seeds</span>
          </label>
          <Link to="/access" className="text-muted-foreground hover:text-gold">
            Buyer Portal
          </Link>
          <Link to="/" className="text-gold underline">
            Showroom ↗
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {feedback && (
          <div role="status" className="border border-gold/40 bg-surface px-4 py-3 text-gold">
            {feedback}
          </div>
        )}

        {selectedInquiry && (
          <form
            onSubmit={(e) => void handleProposeViewing(e)}
            className="border border-gold bg-surface p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <strong>
                Unlock Private Vault &amp; Propose Viewing for {selectedInquiry.fullName} (
                {selectedInquiry.id})
              </strong>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="underline"
              >
                Cancel
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-muted-foreground uppercase text-[10px]">
                Proposed Salon Viewing Window
              </span>
              <input
                value={proposedSlot}
                onChange={(e) => setProposedSlot(e.target.value)}
                required
                className="w-full bg-background border border-gold/30 px-3 py-2 text-foreground"
              />
            </label>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gold text-background uppercase tracking-widest"
            >
              Grant Vault Access &amp; Send Invitation ↗
            </button>
          </form>
        )}

        <section className="space-y-4">
          <h1 className="font-display text-3xl">Private Access &amp; Viewing Inquiries</h1>
          <div className="overflow-x-auto border border-gold/20 bg-surface">
            <table className="w-full text-left">
              <thead className="border-b border-gold/20 bg-background uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Dossier / Buyer</th>
                  <th className="p-4">Vehicle &amp; Advisor</th>
                  <th className="p-4">Salon / Preferred Date</th>
                  <th className="p-4">Status &amp; Vault</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {visibleInquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td className="p-4">
                      <strong>{inq.fullName}</strong>
                      {inq.isDemoSeed && (
                        <span className="ml-2 px-2 py-0.5 border border-gold/40 text-gold text-[10px]">
                          Demo seed
                        </span>
                      )}
                      <div className="text-muted-foreground">
                        {inq.id} · {inq.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <strong>{inq.vehicleName}</strong>
                      <div className="text-muted-foreground">
                        Advisor: {inq.assignedAdvisorName}
                      </div>
                    </td>
                    <td className="p-4">
                      <strong>
                        {inq.city} · {inq.preferredDate}
                      </strong>
                      <div className="text-muted-foreground">
                        {inq.proposedSlot || "No slot proposed"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="uppercase text-gold">{inq.status.replace("_", " ")}</span>
                      <div className="text-muted-foreground">
                        Vault: {inq.vaultAccessUnlocked ? "Unlocked" : "Locked"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inq)}
                          className="px-3 py-1.5 bg-gold text-background uppercase text-[10px]"
                        >
                          Unlock &amp; Schedule
                        </button>
                        <Link
                          to={`/access?ref=${encodeURIComponent(inq.id)}&token=${encodeURIComponent(inq.accessToken)}`}
                          className="underline text-muted-foreground hover:text-gold"
                        >
                          Buyer view
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl">Dealer Collection Availability Authority</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inventory.map((v) => (
              <div key={v.id} className="border border-gold/20 bg-surface p-4 space-y-2">
                <strong className="font-display text-lg block">{v.name}</strong>
                <div className="text-muted-foreground">
                  Chassis: {v.chassisNumber} · Vault Price: ${v.privatePriceUsd?.toLocaleString()}{" "}
                  USD
                </div>
                <label className="block pt-1">
                  <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                    Availability Status
                  </span>
                  <select
                    value={v.availability}
                    onChange={(e) =>
                      void handleAvailabilityChange(v.id, e.target.value as VehicleAvailability)
                    }
                    className="w-full bg-background border border-gold/30 px-2 py-1.5 text-foreground"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </label>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ConciergeDesk;
