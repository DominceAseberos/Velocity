import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Car {
  name: string;
  year: string;
  engine: string;
  speed: string;
  image: string;
  gallery: string[];
}

const CARS: Car[] = [
  {
    name: "Bugatti Chiron",
    year: "2024",
    engine: "8.0L W16",
    speed: "2.4s",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80",
    gallery: ["/assets/cars/chiron_rear.png"],
  },
  {
    name: "Rolls-Royce Spectre",
    year: "2024",
    engine: "Electric",
    speed: "4.4s",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80",
    gallery: ["/assets/cars/spectre_rear.png"],
  },
  {
    name: "Ferrari SF90",
    year: "2024",
    engine: "4.0L V8 Hybrid",
    speed: "2.5s",
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&q=80",
    gallery: ["/assets/cars/ferrari_sf90_rear.png"],
  },
  {
    name: "Lamborghini Revuelto",
    year: "2024",
    engine: "6.5L V12 Hybrid",
    speed: "2.5s",
    image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&q=80",
    gallery: ["/assets/cars/revuelto_rear.png"],
  },
  {
    name: "Aston Martin DB12",
    year: "2024",
    engine: "4.0L V8 TT",
    speed: "3.5s",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80",
    gallery: ["/assets/cars/db12_rear.png"],
  },
];

const ALL_CARS = [...CARS, ...CARS];

const FeaturedCollection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    
    const mm = gsap.matchMedia();
    
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Reveal the entire track smoothly
      gsap.fromTo(
        trackRef.current,
        { 
          opacity: 0, 
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });
    
    // Fallback for prefers-reduced-motion
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(trackRef.current, { opacity: 1, y: 0 });
    });

    return () => {
      mm.revert();
    };
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedCar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedCar]);

  return (
    <section
      ref={sectionRef}
      className="featured-collection"
      aria-label="Featured Collection"
    >
      <div className="featured-collection__content">
        <div className="featured-collection__header">
          <div className="featured-collection__divider" />
          <div className="featured-collection__title-container">
            <h2 className="featured-collection__title">
              Featured <span className="featured-collection__title-highlight">Collection</span>
            </h2>
            <p className="featured-collection__scroll-hint">
              HOVER TO EXPLORE
            </p>
          </div>
        </div>

        {/* Auto-scrolling Marquee */}
        <div 
          ref={trackRef} 
          className="featured-collection__track-container overflow-hidden pb-8"
        >
          <div
            className={`featured-collection__marquee ${selectedCar ? 'paused' : ''}`}
            role="region"
            aria-label="Horizontal list of featured cars"
          >
            {ALL_CARS.map((car, index) => (
              <article
                key={`${car.name}-${index}`}
                className="featured-collection__item group"
              >
                <div className="featured-collection__image-container">
                  <img
                    src={car.image}
                    alt={`${car.name} - ${car.year}`}
                    className="featured-collection__image"
                    loading="lazy"
                  />
                </div>
                <div className="featured-collection__item-details">
                  <h3 className="featured-collection__item-title">
                    {car.name}
                  </h3>
                  <p className="featured-collection__item-meta">
                    {car.year} · {car.engine} · 0–60 {car.speed}
                  </p>
                  <button 
                    className="featured-collection__cta"
                    onClick={() => setSelectedCar(car)}
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Car Details Modal */}
      {selectedCar && (
        <div className="car-modal">
          <div 
            className="car-modal__backdrop" 
            onClick={() => setSelectedCar(null)}
            aria-hidden="true"
          />
          <div className="car-modal__content-wrapper" data-lenis-prevent="true">
            <button 
              className="car-modal__close" 
              onClick={() => setSelectedCar(null)}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            
            <div className="car-modal__layout">
              {/* Image Gallery */}
              <div className="car-modal__gallery">
                <div className="car-modal__image-primary">
                  <img src={selectedCar.image} alt={selectedCar.name} />
                </div>
                {selectedCar.gallery.map((img, idx) => (
                  <div key={idx} className="car-modal__image-secondary">
                    <img src={img} alt={`${selectedCar.name} alternative view`} loading="lazy" />
                  </div>
                ))}
              </div>
              
              {/* Details Pane */}
              <div className="car-modal__details">
                <div className="car-modal__divider" />
                <h2 className="car-modal__title">{selectedCar.name}</h2>
                <p className="car-modal__year">MODEL YEAR {selectedCar.year}</p>
                
                <div className="car-modal__specs">
                  <div className="car-modal__spec">
                    <span className="car-modal__spec-label">Engine Architecture</span>
                    <span className="car-modal__spec-value">{selectedCar.engine}</span>
                  </div>
                  <div className="car-modal__spec">
                    <span className="car-modal__spec-label">0-60 MPH</span>
                    <span className="car-modal__spec-value">{selectedCar.speed}</span>
                  </div>
                </div>
                
                <p className="car-modal__description">
                  Every vehicle in the VELOCE collection represents the pinnacle of automotive engineering and design. 
                  This {selectedCar.name} is meticulously maintained and curated for discerning collectors who demand perfection.
                </p>
                
                <button className="car-modal__cta" onClick={() => setSelectedCar(null)}>
                  INQUIRE ABOUT ACQUISITION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedCollection;
