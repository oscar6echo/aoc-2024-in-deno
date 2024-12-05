import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 4");

const target = "XMAS";
console.log({ target, target_length: target.length });

const directions = [
  // x+
  [+1, 0],
  // x-
  [-1, 0],
  // y+
  [0, +1],
  // y-
  [0, -1],
  // x+y+
  [+1, +1],
  // x+y-
  [+1, -1],
  // x-y+
  [-1, +1],
  // x-y-
  [-1, -1],
];
console.log({ directions });

const count_target_starting_from = (i: number, j: number, arr: string[][]) => {
  /** */
  const n = arr.length;
  const m = arr[0].length;

  //   console.log({ i, j });
  let n_match = 0;

  directions.forEach((d) => {
    const w = [arr[i][j]];

    let [_i, _j] = [i, j];
    // console.log({ _i, _j, d });

    for (const _k of d3.range(target.length - 1)) {
      _i += d[0];
      _j += d[1];
      if (0 <= _i && _i < n && 0 <= _j && _j < m) {
        w.push(arr[_i][_j]);
        // console.log({ _i, _j, w });
      } else {
        // console.log("break");
        break;
      }
    }
    const word = w.join("");
    if (word === target) {
      console.log("match", { i, j, d });
      n_match += 1;
    }
  });
  if (n_match > 0) {
    console.log({ i, j, n_match });
    console.log("");
  }
  return n_match;
};

/////////////////// test-1
{
  console.log("test-1");

  const txt = u.read_txt_file("4-test.txt");
  // console.log({ txt });
  const arr = txt.split("\n").map((e) => e.split(""));
  const n = arr.length;
  const m = arr[0].length;

  console.log({
    arr,
    n,
    m,
  });

  let n_target = 0;

  for (const i of d3.range(n)) {
    for (const j of d3.range(m)) {
      const n_match = count_target_starting_from(i, j, arr);
      n_target += n_match;
    }
  }

  console.log({ n_target });
}

/////////////////// run-1
{
  console.log("run-1");

  const txt = u.read_txt_file("4.txt");
  // console.log({ txt });
  const arr = txt.split("\n").map((e) => e.split(""));
  const n = arr.length;
  const m = arr[0].length;

  console.log({
    // arr,
    n,
    m,
  });

  let n_target = 0;

  for (const i of d3.range(n)) {
    for (const j of d3.range(m)) {
      const n_match = count_target_starting_from(i, j, arr);
      n_target += n_match;
    }
  }

  console.log({ n_target });
}

////////////////// PART 2

const is_x_target_centered_at = (
  i: number,
  j: number,
  arr: string[][],
) => {
  /** */
  const n = arr.length;
  const m = arr[0].length;

  if (i == 0 || j === 0 || i === n - 1 || j === m - 1) return false;
  if (arr[i][j] !== "A") return false;

  //   console.log({ i, j, center: arr[i][j] });

  const w1 = [arr[i - 1][j - 1], arr[i + 1][j + 1]].join("");
  const w2 = [arr[i + 1][j - 1], arr[i - 1][j + 1]].join("");
  const targets = ["MS", "SM"];

  if (targets.includes(w1) && targets.includes(w2)) {
    console.log("match", { i, j });
    return true;
  }

  return false;
};

{
  console.log("test-2");

  const txt = u.read_txt_file("4-test.txt");
  // console.log({ txt });
  const arr = txt.split("\n").map((e) => e.split(""));

  const n = arr.length;
  const m = arr[0].length;
  console.log({
    // arr,
    n,
    m,
  });

  let n_target = 0;

  for (const i of d3.range(n)) {
    for (const j of d3.range(m)) {
      const is_match = is_x_target_centered_at(i, j, arr);
      if (is_match) {
        n_target += 1;
      }
    }
  }

  console.log({ n_target });
}

{
  console.log("run-2");

  const txt = u.read_txt_file("4.txt");
  // console.log({ txt });
  const arr = txt.split("\n").map((e) => e.split(""));

  const n = arr.length;
  const m = arr[0].length;
  console.log({
    // arr,
    n,
    m,
  });

  let n_target = 0;

  for (const i of d3.range(n)) {
    for (const j of d3.range(m)) {
      const is_match = is_x_target_centered_at(i, j, arr);
      if (is_match) {
        n_target += 1;
      }
    }
  }

  console.log({ n_target });
}
