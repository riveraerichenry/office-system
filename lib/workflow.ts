export const WORKFLOW = {
  BOOKLET: {
    AVAILABLE: ["ISSUED", "ARCHIVED"],
    ISSUED: ["LIQUIDATED"],
    LIQUIDATED: [],
    ARCHIVED: [],
  },

  RIS: {
    PENDING: ["APPROVED", "REJECTED"],
    APPROVED: ["RELEASED"],
    RELEASED: ["COMPLETED"],
    REJECTED: [],
    COMPLETED: [],
  },
} as const;

export type WorkflowName = keyof typeof WORKFLOW;

export function canTransition(
  workflow: WorkflowName,
  currentStatus: string,
  nextStatus: string
) {
  const transitions =
    WORKFLOW[workflow][
      currentStatus as keyof (typeof WORKFLOW)[typeof workflow]
    ];

  if (!transitions) {
    return false;
  }

  return (transitions as readonly string[]).includes(
    nextStatus
  );
}