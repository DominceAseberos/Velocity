import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  number: string;
  label: string;
}

const STATS: Stat[] = [
  { number: "287", label: "Cars Curated" },
  { number: "42", label: "Marques" },
  { number: "19", label: "Countries" },
];

const BrandPhilosophy = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Pinning the philosophy section for the 'Context' phase
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=50%",
        pin: true,
        pinSpacing: true,
        scrub: true,
      });

      // Fade up reveal for the text content
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50, visibility: "hidden" },
        {
          opacity: 1,
          y: 0,
          visibility: "visible",
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Staggered reveal for the mosaic tiles
      gsap.fromTo(
        tilesRef.current,
        { opacity: 0, scale: 0.8, visibility: "hidden" },
        {
          opacity: 1,
          scale: 1,
          visibility: "visible",
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(contentRef.current, { opacity: 1, y: 0, visibility: "visible" });
      gsap.set(tilesRef.current, { opacity: 1, scale: 1, visibility: "visible" });
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="brand-philosophy" aria-labelledby="philosophy-title">
      <div className="brand-philosophy__content">
        <div className="brand-philosophy__grid">
          {/* Image */}
          <div className="brand-philosophy__image-wrapper">
            <div className="brand-philosophy__image-container">
              {/* Tile 1 */}
              <div ref={(el) => { tilesRef.current[0] = el; }} className="brand-philosophy__tile brand-philosophy__tile--1">
                <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80" alt="" className="brand-philosophy__image" loading="lazy" />
              </div>
              {/* Tile 2 */}
              <div ref={(el) => { tilesRef.current[1] = el; }} className="brand-philosophy__tile brand-philosophy__tile--2">
                <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80" alt="" className="brand-philosophy__image" loading="lazy" />
              </div>
              {/* Tile 3 */}
              <div ref={(el) => { tilesRef.current[2] = el; }} className="brand-philosophy__tile brand-philosophy__tile--3">
                <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80" alt="" className="brand-philosophy__image" loading="lazy" />
              </div>
              {/* Tile 4 */}
              <div ref={(el) => { tilesRef.current[3] = el; }} className="brand-philosophy__tile brand-philosophy__tile--4">
                <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80" alt="Detailed view of a luxury car interior" className="brand-philosophy__image" loading="lazy" />
              </div>
            </div>
            
            {/* Subtle gold decoration lines that complement the mosaic layout */}
            <div className="brand-philosophy__image-decoration" aria-hidden="true" />
          </div>

          {/* Text */}
          <div ref={contentRef} className="brand-philosophy__text-wrapper">
            <div className="brand-philosophy__divider" aria-hidden="true" />
            <h2 id="philosophy-title" className="brand-philosophy__title">
              Precision is not a feature.{" "}
              <span className="brand-philosophy__title-highlight">It's a philosophy.</span>
            </h2>
            <p className="brand-philosophy__description">
              Every vehicle in the VELOCE collection has been handpicked by our
              global network of automotive specialists. We don't deal in
              inventory — we curate investment-grade machines for collectors
              who understand that true luxury is never mass-produced.
            </p>

            {/* Stats */}
            <div className="brand-philosophy__stats" role="list">
              {STATS.map((stat) => (
                <div key={stat.label} role="listitem">
                  <div className="brand-philosophy__stat-number">
                    {stat.number}
                  </div>
                  <div className="brand-philosophy__stat-label">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandPhilosophy;
