import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, "supabase", "migrations");

// read migration files
let files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith(".sql"));

// group by timestamp prefix (first 14 characters, e.g. 20250128000017)
let groups = {};
files.forEach(f => {
  let prefix = f.slice(0, 14);
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push(f);
});

// sort by timestamp
let sortedKeys = Object.keys(groups).sort();
let counter = 1;

sortedKeys.forEach(prefix => {
  let group = groups[prefix];
  if (group.length > 1) {
    console.log(`⚠️ Found duplicates for ${prefix}:`, group);

    group.forEach((filename, idx) => {
      if (idx === 0) return; // keep the first one untouched

      // assign a new unique timestamp
      let newTimestamp = (parseInt(prefix) + counter++).toString();
      let newFilename = filename.replace(prefix, newTimestamp);

      fs.renameSync(
        path.join(MIGRATIONS_DIR, filename),
        path.join(MIGRATIONS_DIR, newFilename)
      );

      console.log(`➡️ Renamed ${filename} → ${newFilename}`);
    });
  }
});

console.log("✅ Migration filenames fixed.");

// Reset DB so migrations replay cleanly
try {
  console.log("🔄 Resetting database...");
  execSync("supabase db reset", { stdio: "inherit" });
  console.log("✅ Database reset complete.");
} catch (err) {
  console.error("❌ Database reset failed:", err.message);
}
