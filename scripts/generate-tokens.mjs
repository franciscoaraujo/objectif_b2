// Gera src/app/tokens.css (tokens --md-sys-color-*) a partir da cor-semente.
// Uso: node scripts/generate-tokens.mjs
import fs from "node:fs";
import {
  Hct,
  SchemeTonalSpot,
  MaterialDynamicColors,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

const SEED = "#1F4FA0";
const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(SEED)), false, 0);

const lines = [];
for (const key of Object.getOwnPropertyNames(MaterialDynamicColors)) {
  const role = MaterialDynamicColors[key];
  if (!role || typeof role.getArgb !== "function") continue;
  if (role.name.endsWith("_key_color")) continue;
  lines.push(`  --md-sys-color-${role.name.replaceAll("_", "-")}: ${hexFromArgb(role.getArgb(scheme))};`);
}
lines.sort();

const css = `/* Gerado por scripts/generate-tokens.mjs — semente ${SEED}, tema claro. Não edite à mão. */
:root {
${lines.join("\n")}
}
`;
fs.writeFileSync("src/app/tokens.css", css);
console.log(`${lines.length} tokens gravados em src/app/tokens.css`);
