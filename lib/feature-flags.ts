/** New product slices stay independent from the existing local demo. */
export const featureFlags = {
  design2026: import.meta.env.VITE_DESIGN_2026 !== "off",
  gestures2026: import.meta.env.VITE_GESTURES_2026 !== "off",
} as const;
