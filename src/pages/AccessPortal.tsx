import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  collectionGateway,
  type BuyerInquiryRecord,
} from "@/collection/collectionGateway";
import type { CollectionVehicle } from "@/collection/collectionRules";

const AccessPortal = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const initialToken = searchParams.get("token") || "";

  const [refCode, setRefCode] = useState(initialRef);
  const [token, setToken] = useState(initialToken);
  const [inquiry, setInquiry] = useState<BuyerInquiryRecord | null>(null);
  const [inventory, setInventory] = useState<CollectionVehicle[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [compareIds, setCompareIds] = useState<string[]>([
    "bugatti-chiron-2024",
    "ferrari-sf90-2024",
  ]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void collectionGateway.listInventory({ accessToken: token }).then((items) => {
      if (active) setInventory(items);
    });
    return () => {
      active = false;
    };
  }, [token, inquiry]);

  useEffect(() => {
    if (!initialRef || !initialToken) return;
    let active = true;
    void collectionGateway.getInquiry(initialRef, initialToken).then((res) => {
      if (!active) return;
      if (!res.ok) {
        setInquiry(null);
        setError(res.message);
        return;
      }
      setInquiry(res.data);
    });
    return () => {
      active = false;
    };
  }, [initialRef, initialToken]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const res = await collectionGateway.getInquiry(refCode, token);
    if (!res.ok) {
      setInquiry(null);
      setError(res.message);
      return;
    }
    setInquiry(res.data);
  };

  const handleConfirmViewing = async () => {
    if (!inquiry) return;
    setError("");
    setNotice("");
    const res = await collectionGateway.confirmViewingAppointment(inquiry.id, token);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setInquiry(res.data);
    setNotice("Private salon viewing appointment confirmed.");
  };

  const handleCancel = async () => {
    if (!inquiry) return;
    setError("");
    setNotice("");
    const res = await collectionGateway.cancelInquiry(inquiry.id, {
      token,
      actor: "customer",
    });
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setInquiry(res.data);
    setNotice("Your inquiry dossier has been closed.");
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 2
          ? [prev[1], id]
          : [...prev, id],
    );
  };

  const filteredVehicles = useMemo(() => {
    return inventory.filter(
      (v) => categoryFilter === "all" || v.category === categoryFilter,
    );
  }, [inventory, categoryFilter]);

  const comparedVehicles = useMemo(
    () => inventory.filter((v) => compareIds.includes(v.id)),
    [inventory, compareIds],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-gold/15 px-6 py-5 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-[0.3em] text-foreground">
          VELOCE
        </Link>
        <div className="flex items-center gap-6 font-mono-ui text-xs uppercase tracking-widest">
          <Link to="/concierge" className="text-muted-foreground hover:text-gold">
            Concierge Desk
          </Link>
          <Link to="/" className="text-gold underline">
            Showroom ↗
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="space-y-4">
          <p className="font-mono-ui text-xs uppercase tracking-[0.25em] text-gold">
            Verified Buyer Portal &amp; Dossier Lookup
          </p>
          <h1 className="font-display text-3xl sm:text-4xl">
            Private Vault Access &amp; Viewing Schedule
          </h1>

          <form
            onSubmit={(e) => void handleLookup(e)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-gold/20 bg-surface p-4"
          >
            <input
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              placeholder="Dossier Ref (e.g. VLC-DEMO-001)"
              className="bg-background border border-gold/20 px-3 py-2.5 font-mono-ui text-xs text-foreground"
              required
            />
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Access Token (e.g. demo-token-001)"
              className="bg-background border border-gold/20 px-3 py-2.5 font-mono-ui text-xs text-foreground"
              required
            />
            <button
              type="submit"
              className="font-mono-ui text-xs uppercase tracking-[0.25em] bg-gold text-background px-4 py-2.5"
            >
              Unlock Dossier →
            </button>
          </form>

          {error && (
            <div
              role="alert"
              className="border border-red-500/40 bg-red-950/30 px-4 py-3 font-mono-ui text-xs text-red-300"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="border border-gold/40 bg-surface px-4 py-3 font-mono-ui text-xs text-gold"
            >
              {notice}
            </div>
          )}

          {inquiry && (
            <div className="border border-gold/30 bg-surface p-6 space-y-4 font-mono-ui text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gold/15 pb-3">
                <div>
                  <span className="text-muted-foreground">{inquiry.id}</span>
                  <h2 className="font-display text-2xl text-foreground">
                    {inquiry.fullName} — {inquiry.vehicleName}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 border border-gold/40 text-gold uppercase">
                    {inquiry.status.replace("_", " ")}
                  </span>
                  <span className="px-3 py-1 border border-gold/20 uppercase">
                    Vault: {inquiry.vaultAccessUnlocked ? "Unlocked" : "Pending Advisor Review"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-muted-foreground block text-[10px]">ASSIGNED ADVISOR</span>
                  <strong>
                    {inquiry.assignedAdvisorName} ({inquiry.assignedAdvisorEmail})
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">SALON &amp; REQUESTED DATE</span>
                  <strong>
                    {inquiry.city} · {inquiry.preferredDate}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">PROPOSED VIEWING WINDOW</span>
                  <strong>{inquiry.proposedSlot || "Awaiting advisor scheduling"}</strong>
                </div>
              </div>

              {inquiry.status !== "cancelled" && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {inquiry.status === "appointment_proposed" && (
                    <button
                      type="button"
                      onClick={() => void handleConfirmViewing()}
                      className="px-5 py-2.5 bg-gold text-background uppercase tracking-widest"
                    >
                      Confirm Private Viewing Slot ✓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleCancel()}
                    className="px-5 py-2.5 border border-red-400/50 text-red-300 uppercase tracking-widest"
                  >
                    Cancel Inquiry
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono-ui text-xs uppercase tracking-[0.25em] text-gold">
                Collection Discovery &amp; Comparison
              </p>
              <h2 className="font-display text-2xl sm:text-3xl">
                Filter Inventory &amp; Compare Specifications
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 font-mono-ui text-[10px] uppercase">
              {["all", "Hypercar", "Grand Tourer", "Electric Bespoke"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 border ${
                    categoryFilter === cat
                      ? "border-gold bg-gold text-background"
                      : "border-gold/20 bg-surface text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredVehicles.map((car) => {
              const isCompared = compareIds.includes(car.id);
              return (
                <article
                  key={car.id}
                  className="border border-gold/20 bg-surface p-5 space-y-3 font-mono-ui text-xs"
                >
                  <div className="flex justify-between items-center text-[10px] uppercase">
                    <span className="text-gold">{car.category}</span>
                    <span className="px-2 py-0.5 border border-gold/30">{car.availability}</span>
                  </div>
                  <h3 className="font-display text-xl text-foreground">{car.name}</h3>
                  <div className="text-muted-foreground space-y-1">
                    <div>
                      Engine: <strong className="text-foreground">{car.engine}</strong> ({car.powerHp} HP)
                    </div>
                    <div>
                      0–100 km/h: <strong className="text-foreground">{car.speed0to100}</strong> · Top:{" "}
                      {car.topSpeedKmh} km/h
                    </div>
                    <div>
                      Price:{" "}
                      <strong className="text-gold">
                        {car.privatePriceUsd
                          ? `$${car.privatePriceUsd.toLocaleString()} USD`
                          : car.publicPriceLabel}
                      </strong>
                    </div>
                    {car.chassisNumber && (
                      <div>
                        Chassis: <strong className="text-foreground">{car.chassisNumber}</strong>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(car.id)}
                    className={`w-full py-2 border text-[10px] uppercase tracking-widest ${
                      isCompared
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-gold/20 text-muted-foreground"
                    }`}
                  >
                    {isCompared ? "Selected for Comparison ✓" : "Compare Vehicle"}
                  </button>
                </article>
              );
            })}
          </div>

          {comparedVehicles.length > 0 && (
            <div className="border border-gold/30 bg-surface p-6 space-y-4">
              <h3 className="font-display text-xl">
                Side-by-Side Comparison ({comparedVehicles.length}/2)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-ui text-xs">
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="border border-gold/15 bg-background p-4 space-y-1.5">
                    <strong className="font-display text-lg block">{v.name}</strong>
                    <div>Powertrain: {v.engine} ({v.powerHp} HP)</div>
                    <div>0–100 km/h: {v.speed0to100} · Top speed: {v.topSpeedKmh} km/h</div>
                    <div>Availability: {v.availability.toUpperCase()}</div>
                    <div>
                      Pricing:{" "}
                      {v.privatePriceUsd
                        ? `$${v.privatePriceUsd.toLocaleString()} USD`
                        : v.publicPriceLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AccessPortal;
