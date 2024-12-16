import { assert } from "@std/assert/assert";
import * as fs from "@std/fs";
import * as path from "@std/path";

const read_txt_file = (filename: string, folder = "input") => {
  /** */

  const here = import.meta.dirname || ".";
  const p = path.join(here, "..", "..", folder, filename);
  assert(fs.exists(p), "missing file");

  const txt = Deno.readTextFileSync(p);
  return txt;
};

const clone = <T>(obj: T): T => {
  /** */

  return JSON.parse(JSON.stringify(obj));
};

const log = (obj: object) => {
  /** */
  console.log(Deno.inspect(obj, { depth: 8, colors: true }));
};

export default { read_txt_file, clone, log };
