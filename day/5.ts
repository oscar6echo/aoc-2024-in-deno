import { assert } from "@std/assert/assert";

import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 5");

/////////////////// test-1
console.log("test-1");

type Constraints = {
  [page: number]: {
    after: number[];
  };
};

const build = (txt: string) => {
  /** */

  const arr = txt.split("\n");
  const i = arr.map((_, i) => i).find((i) => arr[i].length === 0);
  assert(i !== undefined);

  const rules = arr.slice(0, i).map((e) => {
    const s = e.split("|").map((f) => parseInt(f));
    assert(s.length === 2);
    return s;
  });

  const updates = arr.slice(i + 1, arr.length).map((e) => {
    const s = e.split(",").map((f) => parseInt(f));
    assert(s.length % 2 === 1);
    return s;
  });

  const constraints: Constraints = {};
  for (const e of rules) {
    e.forEach((f, i) => {
      if (!constraints[f]) {
        constraints[f] = { after: [] };
      }
      if (i === 0) {
        constraints[f].after.push(e[i + 1]);
      }
    });
  }

  return { arr, rules, updates, constraints };
};

const find_ordered_updates = (
  updates: number[][],
  constraints: Constraints,
) => {
  /** */

  const valid: number[][] = [];
  const invalid: number[][] = [];

  for (const update of updates) {
    let ok = true;
    update.forEach((page, i) => {
      update.slice(i).forEach((next_page) => {
        if (ok && constraints[next_page].after.includes(page)) {
          ok = false;
        }
      });
    });

    if (ok) {
      valid.push(update);
    } else {
      invalid.push(update);
    }
  }
  return { valid, invalid };
};

const calc_score = (updates: number[][]) => {
  /** */

  const score = d3.sum(updates.map((e) => {
    const i = (e.length - 1) / 2;
    return e[i];
  }));

  return score;
};

const swap = (arr: number[], i: number, j: number) => {
  /** */

  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
};

const order_update = (update: number[], constraints: Constraints) => {
  /** */
  if (update.length < 3) return update;

  //   console.log("");
  //   console.log({ update });

  const _update = [...update];
  let ok = false;

  while (!ok) {
    let _ok = true;
    for (const i of d3.range(update.length - 2, -1, -1)) {
      const page = _update[i];
      const next_page = _update[i + 1];
      if (constraints[next_page].after.includes(page)) {
        // console.log({ page, next_page });
        swap(_update, i, i + 1);
        // console.log({ _update });
        _ok = false;
        break;
      }
    }
    if (_ok) ok = true;
  }
  return _update;
};

//////////////// test-1

{
  console.log("test-1");
  const txt = u.read_txt_file("5-test.txt");
  const { rules, updates, constraints } = build(txt);
  console.log({ rules, updates, constraints });

  const { valid } = find_ordered_updates(updates, constraints);
  console.log({ valid });

  const score = calc_score(valid);
  console.log({ score });
}

//////////////// run-1

{
  console.log("run-1");

  const txt = u.read_txt_file("5.txt");
  const { updates, constraints } = build(txt);
  //   console.log({  updates, constraints });

  const { valid } = find_ordered_updates(updates, constraints);
  console.log({ n_valid: valid.length });

  const score = calc_score(valid);
  console.log({ score });
}

//////////////// test-2

{
  console.log("test-2");
  const txt = u.read_txt_file("5-test.txt");
  const { rules, updates, constraints } = build(txt);
  console.log({ rules, updates, constraints });

  const { invalid } = find_ordered_updates(updates, constraints);
  console.log({ invalid });

  const valid = invalid.map((e) => order_update(e, constraints));

  console.log({ valid });
  const score = calc_score(valid);
  console.log({ score });
}

//////////////// run-2

{
  console.log("run-2");
  const txt = u.read_txt_file("5.txt");
  const { updates, constraints } = build(txt);
  // console.log({  updates, constraints });

  const { invalid } = find_ordered_updates(updates, constraints);
  console.log({ n_invalid: invalid.length });

  const valid = invalid.map((e) => order_update(e, constraints));
  console.log({ n_valid: valid.length });

  const score = calc_score(valid);
  console.log({ score });
}
