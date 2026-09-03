import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !/\.(ts|tsx|js|mjs|cjs|json|css)$/.test(specifier)
  ) {
    const parent = context.parentURL;
    if (parent) {
      const base = dirname(fileURLToPath(parent));
      const tsPath = join(base, `${specifier}.ts`);
      if (existsSync(tsPath)) {
        return { shortCircuit: true, url: pathToFileURL(tsPath).href };
      }
    }
  }
  return nextResolve(specifier, context);
}
