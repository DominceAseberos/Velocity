import { useRef, useEffect, useState } from "react";

const TESTIMONIALS = [
  {
    quote: "I've bought twelve cars through VELOCE. The experience is unlike anything else in the market.",
    name: "A. Hartmann",
    city: "Dubai",
  },
  {
    quote: "They found a '62 GTO that three other houses couldn't source. In six weeks.",
    name: "M. Chen",
    city: "Singapore",
  },
  {
    quote: "White-glove doesn't begin to describe it. This is what true luxury feels like.",
    name: "R. Abramović",
    city: "Monaco",
  },
];

const Testimonials = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonial = TESTIMONIALS[currentIndex];

  return (
    <section
      ref={ref}
      className="relative py-32 overflow-hidden"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=60)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      <div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s ease-out",
        }}
      >
        <div className="w-12 h-px bg-gold mx-auto mb-12" />
        <blockquote
          className="font-display text-3xl sm:text-4xl lg:text-5xl italic text-foreground leading-snug mb-10 transition-opacity duration-500"
          key={currentIndex}
        >
          "{testimonial.quote}"
        </blockquote>
        <p className="font-mono-ui text-[10px] tracking-[0.4em] uppercase text-gold">
          {testimonial.name}, {testimonial.city}
        </p>

        {/* Dots */}
        <div className="flex gap-2 justify-center mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-gold w-6" : "bg-gold/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
