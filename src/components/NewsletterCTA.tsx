import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FULL_COLLECTION_SOURCE,
  type BuyerInquiryErrors,
  type BuyerInquiryInput,
} from "@/collection/collectionRules";
import { collectionGateway, type BuyerInquiryRecord } from "@/collection/collectionGateway";

function newIdemKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `vlc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultDate = () => {
  const dt = new Date();
  dt.setDate(dt.getDate() + 7);
  return dt.toISOString().slice(0, 10);
};

const NewsletterCTA = () => {
  const [formData, setFormData] = useState<BuyerInquiryInput>({
    fullName: "",
    email: "",
    phone: "",
    vehicleId: FULL_COLLECTION_SOURCE[0].id,
    inquiryType: "private_viewing",
    preferredDate: defaultDate(),
    city: "Geneva Salon",
    notes: "",
  });

  const [fieldErrors, setFieldErrors] = useState<BuyerInquiryErrors>({});
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [createdRecord, setCreatedRecord] = useState<BuyerInquiryRecord | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => newIdemKey());

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const updateField = <K extends keyof BuyerInquiryInput>(key: K, value: BuyerInquiryInput[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    if (status === "error") setStatus("idle");
    setIdempotencyKey(newIdemKey());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const result = await collectionGateway.createInquiry(formData, idempotencyKey);

    if (!result.ok) {
      setStatus("error");
      setMessage(result.message);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    setStatus("success");
    setCreatedRecord(result.data);
    setMessage(
      `Dossier ${result.data.id} assigned to ${result.data.assignedAdvisorName} (${result.data.assignedAdvisorEmail}).`,
    );
  };

  return (
    <section id="private-access" ref={ref} className="relative bg-background carbon-texture py-28">
      <div
        className="relative z-10 max-w-2xl mx-auto px-6 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s ease-out",
        }}
      >
        <div className="w-12 h-px bg-gold mx-auto mb-8" />
        <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4">
          Request <span className="italic text-gold">Private Access</span>
        </h2>
        <p className="font-mono-ui text-xs text-muted-foreground tracking-wider mb-10">
          Private Vault pricing and chassis provenance are disclosed only to verified buyers.
        </p>

        {!createdRecord ? (
          <form onSubmit={(e) => void handleSubmit(e)} noValidate className="text-left space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Alexander Sterling"
                  className="w-full bg-surface border border-gold/20 px-4 py-3 font-mono-ui text-xs text-foreground focus:outline-none focus:border-gold"
                />
                {fieldErrors.fullName && (
                  <small className="text-red-400 font-mono-ui text-[10px] block mt-1">
                    {fieldErrors.fullName}
                  </small>
                )}
              </div>

              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-surface border border-gold/20 px-4 py-3 font-mono-ui text-xs text-foreground focus:outline-none focus:border-gold"
                />
                {fieldErrors.email && (
                  <small className="text-red-400 font-mono-ui text-[10px] block mt-1">
                    {fieldErrors.email}
                  </small>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Direct Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+41 22 555 0194"
                  className="w-full bg-surface border border-gold/20 px-4 py-3 font-mono-ui text-xs text-foreground focus:outline-none focus:border-gold"
                />
                {fieldErrors.phone && (
                  <small className="text-red-400 font-mono-ui text-[10px] block mt-1">
                    {fieldErrors.phone}
                  </small>
                )}
              </div>

              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Preferred Salon / City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Geneva / London / Dubai"
                  className="w-full bg-surface border border-gold/20 px-4 py-3 font-mono-ui text-xs text-foreground focus:outline-none focus:border-gold"
                />
                {fieldErrors.city && (
                  <small className="text-red-400 font-mono-ui text-[10px] block mt-1">
                    {fieldErrors.city}
                  </small>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Collection Vehicle
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => updateField("vehicleId", e.target.value)}
                  className="w-full bg-surface border border-gold/20 px-3 py-3 font-mono-ui text-xs text-foreground focus:outline-none focus:border-gold"
                >
                  {FULL_COLLECTION_SOURCE.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.availability.toUpperCase()})
                    </option>
                  ))}
                </select>
                {fieldErrors.vehicleId && (
                  <small className="text-red-400 font-mono-ui text-[10px] block mt-1">
                    {fieldErrors.vehicleId}
                  </small>
                )}
              </div>

              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Inquiry Purpose
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) =>
                    updateField("inquiryType", e.target.value as BuyerInquiryInput["inquiryType"])
                  }
                  className="w-full bg-surface border border-gold/20 px-3 py-3 font-mono-ui text-xs text-foreground focus:outline-none focus:border-gold"
                >
                  <option value="private_viewing">Private Salon Viewing</option>
                  <option value="vault_access">Private Vault Price Unlock</option>
                  <option value="acquisition_dossier">Full Chassis Dossier</option>
                </select>
              </div>

              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => updateField("preferredDate", e.target.value)}
                  className="w-full bg-surface border border-gold/20 px-3 py-3 font-mono-ui text-xs text-foreground focus:outline-none focus:border-gold"
                />
                {fieldErrors.preferredDate && (
                  <small className="text-red-400 font-mono-ui text-[10px] block mt-1">
                    {fieldErrors.preferredDate}
                  </small>
                )}
              </div>
            </div>

            {status === "error" && message && (
              <div role="alert" className="border border-red-500/40 bg-red-950/30 px-4 py-3 font-mono-ui text-xs text-red-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full font-mono-ui text-xs tracking-[0.3em] uppercase px-6 py-4 bg-gold text-background hover:bg-gold/90 transition-colors"
            >
              REQUEST PRIVATE ACCESS &amp; VIEWING
            </button>
          </form>
        ) : (
          <div className="border border-gold/30 bg-surface p-8 text-left space-y-4">
            <p className="font-mono-ui text-xs uppercase tracking-widest text-gold">
              Inquiry Logged &amp; Assigned
            </p>
            <h3 className="font-display text-2xl text-foreground">
              {createdRecord.vehicleName}
            </h3>
            <p className="font-mono-ui text-xs text-muted-foreground">{message}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gold/15 p-4 font-mono-ui text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">DOSSIER REF</span>
                <strong className="text-foreground">{createdRecord.id}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">ACCESS TOKEN</span>
                <strong className="text-foreground">{createdRecord.accessToken}</strong>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={`/access?ref=${encodeURIComponent(createdRecord.id)}&token=${encodeURIComponent(createdRecord.accessToken)}`}
                className="font-mono-ui text-[11px] tracking-[0.25em] uppercase px-5 py-3 bg-gold text-background"
              >
                Open Buyer Dossier &amp; Vault ↗
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCreatedRecord(null);
                  setStatus("idle");
                }}
                className="font-mono-ui text-[11px] tracking-[0.25em] uppercase px-5 py-3 border border-gold/30 text-foreground"
              >
                Submit Another Inquiry
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsletterCTA;
