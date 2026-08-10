# Felt Good - Project Folder Structure

This document outlines the organization of the **Felt Good** project folder.

```text
E:\Felt good
├── Felt_Good_Wholesale_Catalogue_2026-27.pdf   # Original brand & product catalogue
├── folder_structure.md                         # This file
│
└── website/                                    # The main React frontend application
    ├── node_modules/                           # Installed npm dependencies
    ├── public/                                 # Static assets (favicons, etc.)
    │
    ├── src/                                    # Main application source code
    │   ├── data/
    │   │   └── products.js                     # Mock database containing all categories and pricing
    │   │
    │   ├── pages/
    │   │   ├── Home.jsx                        # Landing page with promo banners & 7 category grids
    │   │   └── ProductDetail.jsx               # Dynamic inner product pages with 3-image galleries
    │   │
    │   ├── App.jsx                             # Main layout wrapper and React Router configuration
    │   ├── App.css                             # Scoped styles for components (Hero, Grid, Banner)
    │   ├── index.css                           # Global design tokens (fonts, brand colors)
    │   └── main.jsx                            # React DOM mounting entry point
    │
    ├── package.json                            # Project scripts (npm run dev) and dependencies
    ├── vite.config.js                          # Vite bundler configuration
    └── index.html                              # Root HTML template
```

## Summary of Organization
- **Separation of Concerns**: The original business files (PDF) sit at the root level, keeping the web development environment completely isolated inside the `website/` directory.
- **Scalable Source (`src/`)**: By breaking down the UI into `pages/` and keeping the raw catalogue data in `data/`, the codebase remains highly maintainable. If you need to add real product images, you can easily create an `assets/` folder alongside `data/` and map them!
