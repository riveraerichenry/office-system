import { pool } from "@/lib/db";

type Audit = {
  module: string;
  recordId: string;
  action: string;
  description: string;
  userId: string;
};

export async function createAudit({
  module,
  recordId,
  action,
  description,
  userId,
}: Audit) {
  await pool.query(
    `
    INSERT INTO audit_logs
    (
        module_name,
        record_id,
        action,
        description,
        user_id
    )

    VALUES

    ($1,$2,$3,$4,$5)
    `,
    [
      module,
      recordId,
      action,
      description,
      userId,
    ]
  );
}