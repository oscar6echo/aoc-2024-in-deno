import { assert } from "@std/assert/assert";
import * as fs from "@std/fs";
import * as path from "@std/path";

const load_tvs_file = (filename: string) => {
  /** */

  const here = import.meta.dirname || ".";
  const p = path.join(here, "..", "..", "input", filename);
  assert(fs.exists(p), "missing file");

  const txt = Deno.readTextFileSync(p);
  return txt;
};

export default { load_tvs_file };
