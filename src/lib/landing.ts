export const navLinks = [
  { href: "/#categories", label: "Categories" },
  { href: "/#brands", label: "Brands" },
  { href: "/#counter", label: "Counter" },
  { href: "/#why", label: "Why us" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact us" },
] as const;

export const counterItems = [
  {
    tag: "Fresh",
    name: "Whole chicken",
    note: "Per bird",
  },
  {
    tag: "Fresh",
    name: "Chicken breast",
    note: "Boneless",
  },
  {
    tag: "Fresh",
    name: "Chicken thigh & drumstick",
    note: "Bone-in",
  },
  {
    tag: "Frozen",
    name: "Frozen broiler",
    note: "Carton",
  },
  {
    tag: "Frozen",
    name: "Frozen portions",
    note: "Mixed pack",
  },
  {
    tag: "Beef",
    name: "Beef cubes",
    note: "Curry cut",
  },
  {
    tag: "Beef",
    name: "Beef mince",
    note: "Ground to order",
  },
  {
    tag: "Mutton",
    name: "Mutton shoulder",
    note: "Bone-in",
  },
] as const;

export const reasons = [
  {
    index: "01",
    title: "Two temperatures",
    body: "A fresh line for today and a frozen line for the week ahead. Both leave the same Sharjah counter.",
  },
  {
    index: "02",
    title: "Cut the way you cook",
    body: "Whole birds, boneless portions, cubes, and mince. Tell the desk the piece, not just the animal.",
  },
  {
    index: "03",
    title: "A tray or a hotel order",
    body: "Home kitchens, caterers, and hotel stores order from the same board. Quantity changes. The handling does not.",
  },
  {
    index: "04",
    title: "Sharjah, then the Emirates",
    body: "The house is in Sharjah. Supply reaches kitchens across the UAE once the rate and the cut are confirmed.",
  },
] as const;

export const tickerItems = [
  "Fresh chicken",
  "Frozen poultry",
  "Beef cubes",
  "Mutton",
  "Mince",
  "Whole birds",
  "Food stuff",
  "Sharjah",
] as const;
