import { assert } from "@std/assert/assert";
import * as fs from "@std/fs";
import * as path from "@std/path";

const read_txt_file = (filename: string) => {
  /** */

  const here = import.meta.dirname || ".";
  const p = path.join(here, "..", "..", "input", filename);
  assert(fs.exists(p), "missing file");

  const txt = Deno.readTextFileSync(p);
  return txt;
};

const clone = <T>(obj: T): T => {
  /** */

  return JSON.parse(JSON.stringify(obj));
};

export default { read_txt_file, clone };
