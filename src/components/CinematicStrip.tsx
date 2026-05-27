import { useRef, useEffect, useState } from "react";

const CinematicStrip = () => {
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
    <section ref={ref} className="relative h-[80vh] overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="https://assets.mixkit.co/videos/35205/35205-thumb-720-0.jpg"
      >
        <source
          src="https://assets.mixkit.co/videos/35205/35205-720.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-background/60" />
      <div className="absolute inset-0 vignette" />
      <div
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s ease-out 0.3s",
        }}
      >
        <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl text-foreground text-center italic leading-tight">
          Every curve
          <br />
          <span className="text-gold">tells a story.</span>
        </h2>
      </div>
    </section>
  );
};

export default CinematicStrip;
