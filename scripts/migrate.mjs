// Aplica as migrações de supabase/migrations em ordem.
// Uso: defina DATABASE_URL (string de conexão Postgres do Supabase) e rode `npm run db:migrate`.
// Atenção: caracteres especiais na senha precisam estar codificados (ex.: % -> %25, @ -> %40).
import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Defina DATABASE_URL antes de rodar as migrações.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "supabase", "migrations");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query(
  "create table if not exists public._app_migrations (name text primary key, applied_at timestamptz not null default now())",
);
await client.query("alter table public._app_migrations enable row level security");

for (const file of files) {
  const done = await client.query("select 1 from public._app_migrations where name = $1", [file]);
  if (done.rowCount) {
    console.log(`= ${file} (já aplicada)`);
    continue;
  }
  const sql = fs.readFileSync(path.join(dir, file), "utf8");
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into public._app_migrations (name) values ($1)", [file]);
    await client.query("commit");
    console.log(`+ ${file}`);
  } catch (e) {
    await client.query("rollback");
    console.error(`x ${file}: ${e.message}`);
    process.exit(1);
  }
}
await client.end();

