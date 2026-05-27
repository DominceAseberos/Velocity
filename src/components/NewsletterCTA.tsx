import { useState, useRef, useEffect } from "react";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter an email address.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    // Simulate successful request
    setStatus("success");
    setMessage("Access requested. We will review your inquiry shortly.");
    setEmail("");
  };

  return (
    <section ref={ref} className="relative bg-background carbon-texture py-32">
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
        <p className="font-mono-ui text-xs text-muted-foreground tracking-wider mb-12">
          Our collection is not listed publicly. Serious inquiries only.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="your@email.com"
              className={`flex-1 bg-surface border px-4 py-3 font-mono-ui text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                status === "error" ? "border-red-500 focus:border-red-500" : "border-gold/20 focus:border-gold"
              }`}
              disabled={status === "success"}
            />
            <button 
              type="submit"
              disabled={status === "success"}
              className={`font-mono-ui text-[10px] tracking-[0.3em] uppercase px-6 py-3 transition-colors ${
                status === "success" 
                  ? "bg-surface border border-gold/40 text-gold/60 cursor-not-allowed" 
                  : "bg-gold text-background hover:bg-gold/90"
              }`}
            >
              {status === "success" ? "RECEIVED" : "REQUEST ACCESS"}
            </button>
          </div>
          
          {/* Status Message Container */}
          <div className="absolute left-0 right-0 -bottom-8 flex items-center justify-center h-6">
            <div 
              className={`font-mono-ui text-[10px] tracking-wider transition-all duration-300 ${
                status !== "idle" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              } ${status === "error" ? "text-red-400" : "text-gold"}`}
            >
              {message}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default NewsletterCTA;
