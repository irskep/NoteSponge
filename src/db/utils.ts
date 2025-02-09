import Database from "@tauri-apps/plugin-sql";
import { resetDB } from "../db";

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError: unknown,
    public readonly query?: string,
    public readonly params?: unknown[]
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 100,
  shouldRetry: (error: unknown) => {
    // Retry on connection errors or busy database
    const errorMessage = String(error).toLowerCase();
    return (
      errorMessage.includes("database is locked") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("busy")
    );
  },
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, delayMs, shouldRetry } = {
    ...defaultRetryOptions,
    ...options,
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      // Reset the database connection on retry
      resetDB();
    }
  }
  throw lastError;
}

export async function withTransaction<T>(
  db: Database,
  operation: () => Promise<T>
): Promise<T> {
  try {
    await db.execute("BEGIN TRANSACTION");
    const result = await operation();
    await db.execute("COMMIT");
    return result;
  } catch (error) {
    try {
      await db.execute("ROLLBACK");
    } catch (rollbackError) {
      console.error("Error during rollback:", rollbackError);
    }
    throw new DatabaseError(
      "Transaction failed",
      error
    );
  }
}
