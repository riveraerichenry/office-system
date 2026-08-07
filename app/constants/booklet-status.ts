export const BOOKLET_STATUS = {
  AVAILABLE: "AVAILABLE",
  ISSUED: "ISSUED",
  LIQUIDATED: "LIQUIDATED",
  ARCHIVED: "ARCHIVED",
} as const;

export type BookletStatus =
  (typeof BOOKLET_STATUS)[keyof typeof BOOKLET_STATUS];