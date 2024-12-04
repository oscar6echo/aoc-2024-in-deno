import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 1");

const txt = u.load_tvs_file("2.txt");

const input = d3.csvParseRows(txt, (e: string[]) => {
  const x = e[0].split(" ").filter((e) => !!e).map((e) => parseInt(e));
  return x;
});

const is_sequence_valid = (seq: number[]) => {
  /** */
  const diffs = seq.map((x, i) => i > 0 ? x - seq[i - 1] : 0).slice(1);

  const is_up_moderately = diffs.every((x) => x >= 1 && x <= 3);
  const is_down_moderately = diffs.every((x) => -x >= 1 && -x <= 3);

  return (is_up_moderately || is_down_moderately);
};

const n = input.length;
console.log({ input, n });

/////////////////

let n_valid_1 = 0;

input.forEach((e) => {
  if (is_sequence_valid(e)) {
    n_valid_1 += 1;
  }
});

console.log({ n_valid_1 });

/////////////////

let n_valid_2 = 0;

const _input = input;

_input.forEach((e) => {
  let valid = is_sequence_valid(e);
  for (const r of d3.range(e.length)) {
    if (!valid) {
      const _e = e.slice();
      _e.splice(r, 1);
      valid = is_sequence_valid(_e);
    }
  }

  if (valid) {
    n_valid_2 += 1;
  }
});

console.log({ n_valid_2 });
