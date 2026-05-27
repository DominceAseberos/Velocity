const VeloceFooter = () => {
  return (
    <footer className="relative bg-background border-t border-gold/10 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="font-display text-2xl tracking-[0.3em] text-foreground">
            VELOCE
          </div>

          {/* Links */}
          <nav className="flex gap-8">
            {["Collection", "About", "Contact", "Instagram", "Privacy"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="font-mono-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-gold transition-colors"
                >
                  {link}
                </a>
              )
            )}
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-gold/5 text-center">
          <p className="font-mono-ui text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
            VELOCE © 2026 — Where Rarity Meets the Road
          </p>
        </div>
      </div>
    </footer>
  );
};

export default VeloceFooter;
