const BRANDS = [
  "FERRARI", "BENTLEY", "MCLAREN", "PAGANI", "KOENIGSEGG",
  "ASTON MARTIN", "ROLLS-ROYCE", "BUGATTI", "LAMBORGHINI", "PORSCHE",
  "MERCEDES-AMG", "MASERATI",
];

const BrandMarquee = () => {
  const ticker = BRANDS.join(" · ") + " · ";

  return (
    <section className="relative bg-surface border-y border-gold/10 py-8 overflow-hidden">
      <div className="animate-ticker whitespace-nowrap">
        <span className="font-mono-ui text-[11px] tracking-[0.5em] text-silver/30 uppercase">
          {ticker.repeat(4)}
        </span>
      </div>
    </section>
  );
};

export default BrandMarquee;
