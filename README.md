# Adrian Bonpin - Portfolio Website

A modern, performant portfolio website showcasing custom web development projects. Built with Astro for optimal performance and SEO.

![Portfolio Preview](https://img.shields.io/badge/Built%20with-Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![Styling](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 🚀 Live Demo

Visit the live site: [adrianbonpin.com](https://adrianbonpin.com)

## ✨ Features

-   **⚡ Lightning Fast** - Built with Astro for optimal performance and SEO
-   **🎨 Modern Design** - Clean, contemporary UI with smooth animations
-   **📱 Fully Responsive** - Optimized for all devices and screen sizes
-   **🔍 SEO Optimized** - Comprehensive meta tags, Open Graph, and JSON-LD structured data
-   **🎭 Interactive Hero** - Custom ASCII liquid animation effect
-   **📊 Project Showcase** - Horizontal scrolling gallery with client and personal projects
-   **🍪 Analytics Consent** - Privacy-focused analytics with user consent system
-   **♿ Accessible** - Semantic HTML with proper heading hierarchy
-   **🎯 Smooth Navigation** - Scroll-to-section navigation with smooth animations

## 🛠️ Tech Stack

### Core

-   **[Astro](https://astro.build)** (v5.16.3) - Static Site Generator
-   **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Styling

-   **[Tailwind CSS](https://tailwindcss.com)** (v4.1.17) - Utility-first CSS framework
-   **[@tailwindcss/vite](https://github.com/tailwindcss/tailwindcss)** - Tailwind CSS v4 integration
-   **Custom CSS** - Global styles and animations

### Animations

-   **[Anime.js](https://animejs.com/)** (v4.2.2) - JavaScript animation library
-   **Custom ASCII Liquid Effect** - Interactive hero animation

### Icons & Typography

-   **[@lucide/astro](https://lucide.dev/)** (v0.555.0) - Beautiful & consistent icons
-   **[@fontsource/fusion-pixel-12px-monospaced-jp](https://fontsource.org/)** - Pixel-style font
-   **[@fontsource-variable/raleway](https://fontsource.org/)** - Clean sans-serif font
-   **[@fontsource-variable/lora](https://fontsource.org/)** - Elegant serif font

### Analytics

-   **[Rybbit Analytics](https://rybbit.dev)** - Privacy-focused, anonymous analytics
-   **Custom consent management** - 7-day localStorage tracking

## 📁 Project Structure

```
/
├── public/
│   └── favicon.png           # Site favicon
├── src/
│   ├── assets/
│   │   ├── photos/          # Personal photos
│   │   └── websites/        # Project screenshots
│   ├── components/
│   │   ├── analytics.astro  # Analytics consent banner
│   │   ├── hero-rain.astro  # ASCII liquid animation
│   │   ├── navbar.astro     # Navigation component
│   │   └── projects.astro   # Project showcase carousel
│   ├── layouts/
│   │   └── base.astro       # Base layout with SEO meta tags
│   ├── pages/
│   │   └── index.astro      # Homepage
│   ├── styles/
│   │   └── global.css       # Global styles and Tailwind config
│   └── utils/
│       └── projects.ts      # Project data and type definitions
├── astro.config.mjs         # Astro configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18 or higher)
-   **pnpm** (recommended) or npm/yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/adrianbonpin/www.git
    cd www
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    # or
    npm install
    ```

3. **Start the development server**

    ```bash
    pnpm dev
    # or
    npm run dev
    ```

4. **Open your browser**
    ```
    http://localhost:4321
    ```

### Available Scripts

-   `pnpm dev` - Start development server with hot reload
-   `pnpm build` - Build for production
-   `pnpm preview` - Preview production build locally
-   `pnpm astro` - Run Astro CLI commands

## 🎨 Customization

### Adding New Projects

Edit `src/utils/projects.ts` to add your projects:

```typescript
export const projects: Project[] = [
    {
        title: "Your Project",
        tag: "client", // or 'personal'
        desc: "Project description",
        img: yourProjectImage,
        link: "https://project-url.com",
        framework: "Astro", // or 'NextJs', etc.
    },
    // ... more projects
]
```

### Updating SEO

The base layout accepts SEO props that can be customized per page:

```astro
<Base
  title="Custom Page Title"
  description="Custom page description"
  keywords="custom, keywords, here"
  image="/custom-og-image.png"
>
  <!-- Your page content -->
</Base>
```

### Changing Colors

Edit `src/styles/global.css` to customize the color scheme:

```css
@theme {
    --color-background: /* your color */ ;
    --color-text: /* your color */ ;
    --color-primary: /* your color */ ;
    --color-secondary: /* your color */ ;
}
```

## 🔍 SEO Features

This site includes comprehensive SEO optimization:

-   ✅ Meta descriptions and keywords
-   ✅ Open Graph tags for social media sharing
-   ✅ Twitter Card support
-   ✅ JSON-LD structured data (Person & WebSite schemas)
-   ✅ Canonical URLs
-   ✅ Semantic HTML structure
-   ✅ Proper heading hierarchy (H1 → H2 → H3)
-   ✅ Mobile-friendly viewport configuration
-   ✅ Fast loading times (static site generation)

## 📊 Analytics

This site uses [Rybbit Analytics](https://rybbit.dev) for privacy-focused analytics tracking. The analytics banner:

-   Appears on first visit
-   Stores consent in localStorage
-   Hides for 7 days after acceptance
-   Allows users to opt-out by disabling JavaScript

## 🌐 Browser Support

-   ✅ Chrome (latest)
-   ✅ Firefox (latest)
-   ✅ Safari (latest)
-   ✅ Edge (latest)
-   ✅ Mobile browsers

## 📄 License

Copyright © 2025 Adrian Bonpin. All rights reserved.

## 🤝 Connect

-   **Portfolio**: [adrianbonpin.com](https://adrianbonpin.com)
-   **GitHub**: [@adrianbonpin](https://github.com/adrianbonpin)
-   **LinkedIn**: [adrianbonpin](https://linkedin.com/in/adrianbonpin)
-   **Email**: [adrianbonpin@gmail.com](mailto:adrianbonpin@gmail.com)
-   **Studio**: [DEVGO Studio](https://devgo.studio)

---

Built with ❤️ using [Astro](https://astro.build) | Building Dreams. One Line at a Time.
