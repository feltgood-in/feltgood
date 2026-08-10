const rawCategories = [
  {
    id: "seasonal-decor",
    title: "Felt Christmas Trees",
    subtitle: "Tabletop pieces that bring colour and a soft sculptural presence to festive styling.",
    products: [
      { id: "tree-patchwork", name: "Patchwork Star Tree", image: "cld-sample", color: "bg-sage", price: 4.5 },
      { id: "tree-nordic", name: "Nordic Dot Tree", image: "cld-sample", color: "bg-forest", price: 4.5 },
      { id: "tree-scalloped", name: "Scalloped Pine Tree", image: "cld-sample", color: "bg-crimson", price: 4.5 },
      { id: "tree-petal", name: "Petal Layer Tree", image: "cld-sample", color: "bg-sand", price: 4.5 },
    ]
  },
  {
    id: "festive-essentials",
    title: "Christmas Stockings",
    subtitle: "Statement stockings with appliqué, embroidery and hand-finished edges.",
    products: [
      { id: "stocking-mistletoe", name: "Mistletoe Berry Stocking", image: "cld-sample-2", color: "bg-crimson", price: 6.0 },
      { id: "stocking-ornament", name: "Ornament Appliqué Stocking", image: "cld-sample-2", color: "bg-sage", price: 6.0 },
      { id: "stocking-classic", name: "Classic Red Stocking", image: "cld-sample-2", color: "bg-sand", price: 6.0 },
      { id: "stocking-star", name: "Star Stitched Stocking", image: "cld-sample-2", color: "bg-forest", price: 6.0 },
    ]
  },
  {
    id: "botanical-edit",
    title: "Wreaths, Garlands & Mistletoe",
    subtitle: "Soft, reusable greenery for doors, windows, shelves and installations.",
    products: [
      { id: "wreath-forest", name: "Forest Felt Wreath", image: "cld-sample-3", color: "bg-forest", price: 8.5, desc: "Textured loop wreath with red and ivory berries" },
      { id: "mistletoe-hanging", name: "Mistletoe Hanging", image: "cld-sample-3", color: "bg-sage", price: 4.0, desc: "Layered leaves with hand-rolled felt berries" },
      { id: "mistletoe-bundle", name: "Mistletoe Bundle", image: "cld-sample-3", color: "bg-sand", price: 5.5, desc: "Dimensional foliage finished with a festive red bow" },
      { id: "garland-berry", name: "Festive Berry Garland", image: "cld-sample-3", color: "bg-crimson", price: 7.5, desc: "Flexible garland in a joyful multicolour palette" },
    ]
  },
  {
    id: "countdown",
    title: "Advent Calendars",
    subtitle: "Twenty-five tactile pockets turn the Christmas countdown into a family ritual.",
    products: [
      { id: "advent-village", name: "Village Advent Calendar", image: "cld-sample-2", color: "bg-sand", price: 12.0 },
      { id: "advent-evergreen", name: "Evergreen Advent Calendar", image: "cld-sample-2", color: "bg-sage", price: 12.0 },
      { id: "advent-star", name: "Star Countdown", image: "cld-sample-2", color: "bg-crimson", price: 10.0 },
      { id: "advent-pocket", name: "Pocket Calendar", image: "cld-sample-2", color: "bg-forest", price: 10.0 },
    ]
  },
  {
    id: "hanging-ornaments",
    title: "Woodland Companions",
    subtitle: "Playful, tactile characters for trees, nursery décor, and gifting.",
    products: [
      { id: "ornament-elephant", name: "Festival Elephant", image: "cld-sample-4", color: "bg-crimson", price: 2.5 },
      { id: "ornament-dog", name: "Spotty Dog", image: "cld-sample-4", color: "bg-sand", price: 2.5 },
      { id: "ornament-owl", name: "Wide-Eyed Owl", image: "cld-sample-4", color: "bg-sage", price: 2.5 },
      { id: "ornament-fox", name: "Scarf Fox", image: "cld-sample-4", color: "bg-forest", price: 2.5 },
    ]
  },
  {
    id: "playful-decor",
    title: "Cactus & Statement Shapes",
    subtitle: "Graphic silhouettes and bright embroidery add personality beyond the traditional.",
    products: [
      { id: "decor-cactus-bead", name: "Beaded Cactus", image: "cld-sample", color: "bg-sage", price: 3.5 },
      { id: "decor-cactus-stitch", name: "Stitched Cactus", image: "cld-sample", color: "bg-forest", price: 3.5 },
      { id: "decor-strawberry", name: "Pearl Strawberry", image: "cld-sample-4", color: "bg-crimson", price: 3.0 },
      { id: "decor-star", name: "Graphic Star", image: "cld-sample-4", color: "bg-sand", price: 3.0 },
    ]
  },
  {
    id: "everyday-gifting",
    title: "Felt Key Rings",
    subtitle: "Characterful bag charms and key companions—lightweight and giftable.",
    products: [
      { id: "key-bear", name: "Festive Bear", image: "cld-sample-4", color: "bg-forest", price: 1.5 },
      { id: "key-hedgehog", name: "Little Hedgehog", image: "cld-sample-4", color: "bg-sand", price: 1.5 },
      { id: "key-polar", name: "Polar Bear", image: "cld-sample-4", color: "bg-sage", price: 1.5 },
      { id: "key-bird", name: "Folk Bird", image: "cld-sample-4", color: "bg-crimson", price: 1.5 },
    ]
  },
  {
    id: "animal-stories",
    title: "Animal Stories",
    subtitle: "Whimsical animal narratives captured in felt.",
    products: []
  },
  {
    id: "celebration-bunting",
    title: "Celebration Bunting",
    subtitle: "Festive bunting perfect for any occasion.",
    products: []
  }
];

let globalCounter = 1;
export const categories = rawCategories.map(cat => ({
  ...cat,
  products: cat.products.map(p => ({
    ...p,
    itemNumber: `ITM-${String(globalCounter++).padStart(3, '0')}`
  }))
}));

// Fallback for Product Detail page generic loading if needed
export const products = categories.flatMap(cat => 
  cat.products.map(p => ({
    ...p,
    subtitle: cat.subtitle,
    description: `Beautifully crafted ${p.name}. Made with 100% natural wool felt and eco-friendly dyes.`,
    specs: ["100% Wool Felt", "Hand-stitched details", "Eco-friendly dyes"],
    images: [p.image, p.image, p.image],
    colors: [p.color, "bg-sage", "bg-sand"],
    pricing: {
      base: p.price,
      tier5k: p.price * 0.85,
      tier10k: p.price * 0.75,
    }
  }))
);
