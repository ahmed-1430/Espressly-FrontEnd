export type NavLink = {
  readonly href: string;
  readonly label: string;
  /** Zero-padded index used by the mobile overlay for the editorial numbering. */
  readonly index: string;
};

export const navigation: readonly NavLink[] = [
  { href: "/", label: "Home", index: "01" },
  { href: "/menu", label: "Our Menu", index: "02" },
  { href: "/shop", label: "Shop", index: "03" },
  { href: "/gallery", label: "Gallery", index: "04" },
  { href: "/about", label: "About", index: "05" },
  { href: "/contact", label: "Contact", index: "06" },
] as const;

export const footerNavigation = {
  explore: navigation.filter((link) => link.href !== "/"),
  visit: [
    { label: "Our Menu", href: "/menu" },
    { label: "Visit Espressly", href: "/contact" },
    { label: "Shop Beans", href: "/shop" },
  ],
} as const;