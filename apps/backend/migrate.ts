import sql from "./db";

async function migrate() {
  // Ensure correct SQL syntax here
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log("Migration completed successfully.");
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
