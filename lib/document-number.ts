import { pool } from "@/lib/db";

export async function generateDocumentNumber(
  moduleCode: string
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT *
      FROM document_sequences
      WHERE module_code = $1
      FOR UPDATE
      `,
      [moduleCode]
    );

    if (result.rows.length === 0) {
      throw new Error(
        `Document sequence for ${moduleCode} not found.`
      );
    }

    const sequence = result.rows[0];

    const currentYear = new Date().getFullYear();

    const nextNumber =
      Number(sequence.current_number) + 1;

    await client.query(
      `
      UPDATE document_sequences
      SET
          current_number = $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [
        nextNumber,
        sequence.id,
      ]
    );

    await client.query("COMMIT");

    return `${sequence.prefix}-${currentYear}-${String(
      nextNumber
    ).padStart(sequence.digits, "0")}`;

  } catch (err) {

    await client.query("ROLLBACK");
    throw err;

  } finally {

    client.release();

  }
}