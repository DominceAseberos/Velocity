import { useRef, useEffect, useState } from "react";
import { Search, Handshake, Car } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Curate",
    desc: "Browse our vetted global inventory of the world's rarest automobiles.",
  },
  {
    icon: Handshake,
    title: "Connect",
    desc: "Personal advisor assigned within 24 hours to guide your acquisition.",
  },
  {
    icon: Car,
    title: "Acquire",
    desc: "White-glove delivery, anywhere in the world. Seamless. Secure.",
  },
];

const HowItWorks = () => {
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

  return (
    <section ref={ref} className="relative bg-background carbon-texture py-32">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16">
        <div className="text-center mb-20">
          <div className="w-12 h-px bg-gold mx-auto mb-8" />
          <h2 className="font-display text-4xl sm:text-5xl text-foreground">
            The <span className="italic text-gold">Experience</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(40px)",
                transition: `all 0.6s ease-out ${index * 0.15}s`,
              }}
            >
              <step.icon
                className="w-8 h-8 text-gold mx-auto mb-6"
                strokeWidth={1}
              />
              <h3 className="font-display text-2xl text-foreground mb-4">
                {step.title}
              </h3>
              <p className="font-mono-ui text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
