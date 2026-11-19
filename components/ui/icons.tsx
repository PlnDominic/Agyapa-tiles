import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...p,
});

export const BagIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>);
export const UserIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.9-3.6 3.8-5.4 7.5-5.4s6.6 1.8 7.5 5.4" /></svg>);
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>);
export const MenuIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 8h16M4 16h16" /></svg>);
export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>);
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>);
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const MinusIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 12h14" /></svg>);
export const TruckIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7" /><circle cx="7.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>);
export const ShieldIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>);
export const LayersIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>);
export const PackageIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" /><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9" /></svg>);
export const StarIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)} fill="currentColor" strokeWidth={0}><path d="m12 2.8 2.7 5.8 6.3.7-4.7 4.3 1.3 6.3L12 16.7 6.4 19.9l1.3-6.3L3 9.3l6.3-.7L12 2.8Z" /></svg>);
export const GridIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></svg>);
export const ChartIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>);
export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="9" cy="8.5" r="3.2" /><path d="M2.8 19.5c.7-3 3-4.6 6.2-4.6s5.5 1.6 6.2 4.6M16 5.6a3.2 3.2 0 0 1 0 5.8M18.5 15.2c1.7.6 2.7 2 3 4.3" /></svg>);
export const SettingsIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" /></svg>);
export const TrashIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>);
export const EditIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" /></svg>);
export const MapPinIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 21s7-6 7-11.2A7 7 0 0 0 5 9.8C5 15 12 21 12 21Z" /><circle cx="12" cy="9.8" r="2.4" /></svg>);
export const PhoneIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 5.7 2 2 0 0 1 6 3.5Z" /></svg>);
export const LockIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><rect x="5" y="10.5" width="14" height="9.5" rx="2.2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>);
export const StoreIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5v10h16v-10M9.5 19.5v-5h5v5" /></svg>);
export const SparkIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>);
export const MoreIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)} fill="currentColor" strokeWidth={0}><circle cx="5.5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="18.5" cy="12" r="1.8" /></svg>);
export const LogoutIcon = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h10" /></svg>);
