/**
 * Run pending schema migrations automatically at startup.
 * Each migration checks if the change is already applied before executing.
 * Uses the raw D1 binding to avoid Drizzle ORM type constraints.
 */
export async function runAutoMigrations(d1Binding: any) {
  if (!d1Binding) return;

  await ensureColumn(d1Binding, 'projects', 'views', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(d1Binding, 'posts', 'views', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(d1Binding, 'posts', 'pinned', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(d1Binding, 'posts', 'tags', 'TEXT');
  await ensureColumn(d1Binding, 'users', 'email', 'TEXT');
  await ensureColumn(d1Binding, 'site_settings', 'header_logo_url', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(d1Binding, 'site_settings', 'hero_left_decor_url', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(d1Binding, 'site_settings', 'hero_avatar_url', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(d1Binding, 'site_settings', 'hero_right_decor_url', "TEXT NOT NULL DEFAULT ''");
}

async function ensureColumn(
  d1: { prepare: (sql: string) => { all: () => Promise<{ results?: any[] }>; run: () => Promise<any> } },
  table: string,
  column: string,
  definition: string,
) {
  try {
    const check = d1.prepare(
      `SELECT COUNT(*) as cnt FROM pragma_table_info('${table}') WHERE name='${column}'`,
    );
    const result = await check.all();
    const rows = (result as any).results ?? result;
    const cnt = Number(rows?.[0]?.cnt ?? 0);

    if (cnt === 0) {
      console.log(`[auto-migrate] adding ${table}.${column}`);
      const stmt = d1.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      await stmt.run();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[auto-migrate] skip ${table}.${column}: ${msg}`);
  }
}
