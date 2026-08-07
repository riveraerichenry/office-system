import { Pool } from "pg";
import { pool } from "@/lib/db";

export abstract class BaseService {
  protected db: Pool = pool;
}