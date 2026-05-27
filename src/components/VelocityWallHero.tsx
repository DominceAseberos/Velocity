import { useRef, useState, useEffect } from "react";

interface VideoPanel {
  name: string;
  marque: string;
  video: string;
  fallback: string;
}

const VIDEO_PANELS: VideoPanel[] = [
  {
    name: "Ferrari",
    marque: "Scuderia Ferrari",
    video: "https://assets.mixkit.co/videos/52427/52427-720.mp4",
    fallback: "https://assets.mixkit.co/videos/52427/52427-thumb-720-0.jpg",
  },
  {
    name: "Lamborghini",
    marque: "Automobili Lamborghini",
    video: "https://assets.mixkit.co/videos/34559/34559-720.mp4",
    fallback: "https://assets.mixkit.co/videos/34559/34559-thumb-720-0.jpg",
  },
  {
    name: "Bentley",
    marque: "Bentley Motors",
    video: "https://assets.mixkit.co/videos/47701/47701-720.mp4",
    fallback: "https://assets.mixkit.co/videos/47701/47701-thumb-720-4.jpg",
  },
  {
    name: "Rolls-Royce",
    marque: "Rolls-Royce Motor Cars",
    video: "https://assets.mixkit.co/videos/50990/50990-720.mp4",
    fallback: "https://assets.mixkit.co/videos/50990/50990-thumb-720-0.jpg",
  },
  {
    name: "Bugatti",
    marque: "Bugatti Automobiles",
    video: "https://assets.mixkit.co/videos/50991/50991-720.mp4",
    fallback: "https://assets.mixkit.co/videos/50991/50991-thumb-720-0.jpg",
  },
];

const BRANDS_TICKER = "FERRARI · LAMBORGHINI · ROLLS-ROYCE · BUGATTI · BENTLEY · ASTON MARTIN · MCLAREN · PAGANI · ";

const VelocityWallHero = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.playbackRate = 3.0;
      }
    });
  }, []);

  const handleVideoLoaded = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.playbackRate = 3.0;
    }
  };

  return (
    <section className="velocity-hero" aria-label="Velocity Hero Video Wall">
      {/* Layer 0 — Black background fallback */}
      <div className="velocity-hero__bg" />

      {/* Layer 1 — Video panels */}
      <div className="velocity-hero__panels">
        {VIDEO_PANELS.map((panel, index) => {
          const isHovered = hoveredIndex === index;
          const isClicked = clickedIndex === index;
          const flex = isClicked ? 8 : isHovered ? 2.5 : 1;
          
          // BEM Modifier approach
          const activeModifier = isHovered || isClicked ? "video-panel-active" : "video-panel-rest";

          return (
            <div
              key={panel.name}
              className="velocity-hero__panel"
              style={{ flex }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setClickedIndex(null);
              }}
              onClick={() => setClickedIndex(isClicked ? null : index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setClickedIndex(isClicked ? null : index);
                }
              }}
            >
              {/* Gold separator */}
              {index > 0 && (
                <div className="gold-separator gold-separator-glow absolute left-0 top-0 bottom-0 z-10" />
              )}

              <video
                ref={(el) => { videoRefs.current[index] = el; }}
                className={`velocity-hero__video ${activeModifier}`}
                autoPlay
                muted
                loop
                playsInline
                poster={panel.fallback}
                onLoadedMetadata={() => handleVideoLoaded(index)}
              >
                <source src={panel.video} type="video/mp4" />
              </video>

              {/* Labels & badges */}
              <div
                className="velocity-hero__label"
                style={{ opacity: isHovered || isClicked ? 1 : 0 }}
              >
                <div className="velocity-hero__name">
                  {panel.name}
                </div>
                <div className="velocity-hero__marque">
                  {panel.marque}
                </div>
              </div>

              {/* ▶▶ 3× badge */}
              <div
                className="velocity-hero__badge"
                style={{ opacity: isHovered || isClicked ? 1 : 0 }}
              >
                ▶▶ 3×
              </div>

              {/* Click expanded state: CTA */}
              {isClicked && (
                <div className="velocity-hero__cta-container">
                  <button className="velocity-hero__cta" tabIndex={isClicked ? 0 : -1}>
                    VIEW CAR
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Layer 3 — Vignette */}
      <div className="velocity-hero__vignette" />
      <div className="velocity-hero__bottom-fade" />

      {/* Layer 5 — Hero text */}
      <div 
        className={`velocity-hero__content transition-opacity duration-500 ${clickedIndex !== null ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <p
          className="velocity-hero__subtitle"
          style={{ animationDelay: "0.3s" }}
        >
          EST. 2024 — GLOBAL PRIVATE COLLECTION
        </p>
        <h1 className="velocity-hero__title" style={{ animationDelay: "0.5s" }}>
          <span className="velocity-hero__title-primary">
            NOT JUST
          </span>
          <span className="velocity-hero__title-secondary">
            A CAR.
          </span>
        </h1>
        <p
          className="velocity-hero__description"
          style={{ animationDelay: "0.7s" }}
        >
          An object of obsession. A statement of intent.
        </p>
        <button
          className="velocity-hero__action"
          style={{ animationDelay: "0.9s" }}
        >
          EXPLORE THE COLLECTION
        </button>
      </div>

      {/* Bottom ticker */}
      <div
        className="velocity-hero__ticker"
        style={{ animation: "none" }}
      >
        <div className="hero-fade-up" style={{ animationDelay: "1.2s" }}>
          <div className="velocity-hero__ticker-content">
            {BRANDS_TICKER.repeat(6)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VelocityWallHero;
