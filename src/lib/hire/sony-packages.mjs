// These are request options, not a claim that physical stock is available.
export const SONY_PACKAGES = [
  {
    id: "sony-zve10-camera-only",
    slug: "sony-zve10-camera-only",
    name: "Sony ZV-E10 Camera Only",
    category: "cameras",
    description: "Sony ZV-E10 camera body with one battery and charger. Compatible with Sony E-mount lenses; a lens is not included in the camera-only package.",
    accessories: ["Camera body", "One battery", "Charger"],
    dailyRateMinor: 60000,
  },
  {
    id: "sony-zve10-ready-kit",
    slug: "sony-zve10-ready-kit",
    name: "Sony ZV-E10 Ready-to-Shoot Kit",
    category: "cameras",
    description: "Sony ZV-E10 with 16–50mm lens, battery, power bank, charger and bag. The included camera support or rig must be confirmed by the studio.",
    accessories: ["Camera body", "16–50mm lens", "Battery", "Power bank", "Charger", "Bag", "Camera support / rig — exact type to be confirmed"],
    dailyRateMinor: 85000,
  },
];

export const SONY_PACKAGE_IDS = SONY_PACKAGES.map((item) => item.id);
export const isSonyPackage = (id) => SONY_PACKAGE_IDS.includes(id);

export function validateHireRequestItems(items) {
  if (!Array.isArray(items) || items.length !== 1 || !isSonyPackage(items[0]?.equipmentId)) {
    return { ok: false, error: "Choose one Sony ZV-E10 package. Other equipment is currently unavailable." };
  }
  if (Number(items[0].quantity) !== 1) {
    return { ok: false, error: "Request one camera package at a time. Contact the studio for additional equipment." };
  }
  return { ok: true };
}

export function sonyPackageItem(item) {
  return {
    ...item,
    categoryLabel: "Cameras",
    specs: [],
    images: ["/equipment/sony-zve10.webp"],
    depositMinor: 0,
    quantityTotal: 0,
    ownership: "oxsnow",
    isDemo: false,
    active: true,
    archived: false,
    requestable: true,
  };
}
