import { assert } from "@std/assert/assert";
import * as fs from "@std/fs";
import * as path from "@std/path";
import d3 from "../shared/d3.ts";

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

const build_looper = (n_nest: number, n_iter: number) => {
  const arr: number[] = [];
  const res: number[][] = [];

  const looper = (level = 0) => {
    for (const i of d3.range(n_iter)) {
      arr.push(i);
      if (level === n_nest - 1) {
        res.push(arr.slice());
        arr.splice(level, 1);
        continue;
      }

      looper(level + 1);
      arr.splice(level, 1);
    }
    return res;
  };
  return looper;
};

const permutations = <T>(arr: T[]) => {
  const res: T[][] = [];
  if (arr.length === 0) return [];
  if (arr.length === 1) return [arr];

  for (let i = 0; i < arr.length; i++) {
    const e = arr[i];

    const others = arr.slice(0, i).concat(arr.slice(i + 1));
    const swapped_perm = permutations(others);

    for (let j = 0; j < swapped_perm.length; j++) {
      const finalSwappedPermutation = [e].concat(
        swapped_perm[j],
      );

      res.push(finalSwappedPermutation);
    }
  }

  return res;
};

export default { read_txt_file, clone, log, build_looper, permutations };
