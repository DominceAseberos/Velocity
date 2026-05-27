# VELOCE — Where Rarity Meets the Road

VELOCE is a premium, high-performance web application designed for a luxury private car collection. Built with modern web technologies, it features an immersive scrollytelling experience, cinematic video hero panels, modular BEM-architected CSS, and dynamic GSAP motion design.

## Features

- **Cinematic Video Hero**: Interactive, expanding video panels that dynamically adjust based on user interaction.
- **Infinite Marquee Collection**: Auto-scrolling, hover-paused car gallery featuring custom-generated high-fidelity assets.
- **Deep-Dive Gallery Modal**: Interactive modal with custom styling, frosted glass backdrops, and scroll lock.
- **Responsive Architecture**: Fully responsive layout optimized for mobile, tablet, and ultra-wide desktop experiences.
- **Premium Aesthetics**: Adheres to strict design standards featuring dark mode textures (carbon), gold accents, and elegant typography (Playfair Display & Mono).

## Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: TailwindCSS (Utility) + BEM CSS Architecture (Structure)
- **Animation**: [GSAP](https://gsap.com/) & [Lenis](https://lenis.studiofreight.com/) (Smooth Scrolling)

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

You will need to have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### 1. Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/DominceAseberos/Velocity.git

# Navigate into the project directory
cd Velocity

# Install dependencies
npm install
```

### 2. Running Locally for Development

To start the local development server:

```bash
npm run dev
```

Your application will typically be available at `http://localhost:8080` (or `http://localhost:5173`). Open this URL in your browser to view the app.

### 3. Building for Production

To create an optimized production build:

```bash
npm run build
```

This command bundles the application into the `dist/` directory, ready to be deployed to any static hosting provider.

### 4. Previewing the Production Build

You can preview the production build locally before deploying:

```bash
npm run preview
```

---

## Deployment (Vercel)

This project is pre-configured for seamless deployment on [Vercel](https://vercel.com/):

1. Push your code to a GitHub repository.
2. Log in to Vercel and import the repository.
3. Vercel will automatically detect the **Vite** configuration and the `vercel.json` routing rules.
4. Click **Deploy**.

## License

This project is developed for a private collection portfolio. All rights reserved.
