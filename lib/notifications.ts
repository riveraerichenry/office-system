import { pool } from "@/lib/db";

type NotifyOptions = {
  userIds: string[];
  title: string;
  message: string;
  module?: string;
  recordId?: string;
  notificationType?: string;
  actionUrl?: string;
  priority?: string;
};

export async function notify({
  userIds,
  title,
  message,
  module,
  recordId,
  notificationType = "INFO",
  actionUrl,
  priority = "NORMAL",
}: NotifyOptions) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const userId of userIds) {
      await client.query(
        `
        INSERT INTO notifications
(
    user_id,
    title,
    message,
    module,
    record_id,
    type,
    action_url,
    priority
)
VALUES
($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [
          userId,
          title,
          message,
          module,
          recordId,
          notificationType,
          actionUrl,
          priority,
        ]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}


type NotifyRoleOptions = {
  roleName: string;
  title: string;
  message: string;
  module?: string;
  recordId?: string;
  notificationType?: string;
  actionUrl?: string;
  priority?: string;
};

export async function notifyRole({
  roleName,
  title,
  message,
  module,
  recordId,
  notificationType = "INFO",
  actionUrl,
  priority = "NORMAL",
}: NotifyRoleOptions) {

  const users = await pool.query(
    `
    SELECT DISTINCT
        ur.user_id
    FROM user_roles ur
    INNER JOIN roles r
        ON r.id = ur.role_id
    WHERE
        r.role_name = $1
    `,
    [roleName]
  );

  if (
    users.rows.length === 0
  ) {
    return;
  }

  await notify({
  userIds: users.rows.map(
    (x) => x.user_id
  ),
  title,
  message,
  module,
  recordId,
  notificationType,
  actionUrl,
  priority,
});

}