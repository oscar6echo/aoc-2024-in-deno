import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 21");

type Pos = {
  x: number;
  y: number;
};

type MapKeyPos = {
  [key: string]: Pos;
};

type Counter = {
  [key: string]: number;
};

//////////////////////////

const read_input = (txt: string) => {
  const codes = txt.split("\n")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  return codes;
};

const mapNum: MapKeyPos = {
  "7": { x: 0, y: 0 },
  "8": { x: 1, y: 0 },
  "9": { x: 2, y: 0 },
  "4": { x: 0, y: 1 },
  "5": { x: 1, y: 1 },
  "6": { x: 2, y: 1 },
  "1": { x: 0, y: 2 },
  "2": { x: 1, y: 2 },
  "3": { x: 2, y: 2 },
  " ": { x: 0, y: 3 },
  "0": { x: 1, y: 3 },
  "A": { x: 2, y: 3 },
};

const mapDir: MapKeyPos = {
  " ": { x: 0, y: 0 },
  "^": { x: 1, y: 0 },
  "A": { x: 2, y: 0 },
  "<": { x: 0, y: 1 },
  "v": { x: 1, y: 1 },
  ">": { x: 2, y: 1 },
};

const str_key = (x: number, y: number, to_reverse: boolean) =>
  `${x}|${y}|${to_reverse}`;

const unstr_key = (key: string) => {
  const arr = key.split("|");
  const x = parseInt(arr[0]);
  const y = parseInt(arr[1]);
  const to_reverse = arr[2] === "true";
  return { x, y, to_reverse };
};

const calc_counter = (pad: MapKeyPos, seq: string, count_prev = 1) => {
  /** moves from A to end of seq (excluding next A) */
  let { x: x_prev, y: y_prev } = pad["A"];
  const { x: x_blank, y: y_blank } = pad[" "];
  const counter: Counter = {};

  for (const e of seq) {
    const { x: x_new, y: y_new } = pad[e];
    // to avoid passing through blank cell
    const to_reverse = (x_new === x_blank && y_prev === y_blank) ||
      (y_new === y_blank && x_prev === x_blank);

    const key = str_key(x_new - x_prev, y_new - y_prev, to_reverse);
    // console.log({ key });
    if (!counter[key]) {
      counter[key] = 0;
    }
    counter[key] += count_prev;
    x_prev = x_new;
    y_prev = y_new;
  }
  return counter;
};

const merge_counter = (a: Counter, b: Counter) => {
  const c: Counter = {};
  [...Object.entries(a), ...Object.entries(b)].forEach(([k, v]) => {
    if (!c[k]) {
      c[k] = 0;
    }
    c[k] += v;
  });
  return c;
};

const calc_code = (code: string, n_pad: number) => {
  //   console.log({ code });

  let counter = calc_counter(mapNum, code);
  //   console.log("---init", counter);

  d3.range(n_pad + 1).forEach((_i) => {
    let _counter: Counter = {};
    Object.entries(counter).map(([k, v]) => {
      const { x, y, to_reverse } = unstr_key(k);
      let _code = "";
      // order is consistent with to_reverse definition
      if (x < 0) {
        _code += `<`.repeat(-x);
      }
      if (y > 0) {
        _code += `v`.repeat(y);
      }
      if (y < 0) {
        _code += `^`.repeat(-y);
      }
      if (x > 0) {
        _code += `>`.repeat(x);
      }

      if (to_reverse) {
        _code = _code.split("").reverse().join("");
      }
      _code += "A";
      const count_prev = v;
      //   console.log(x, y, to_reverse, _code, count_prev);
      const __counter = calc_counter(mapDir, _code, count_prev);

      _counter = merge_counter(_counter, __counter);
    });
    counter = _counter;
    // console.log("---iter", counter);
  });

  const n_press = d3.sum(Object.values(counter));
  const code_int = parseInt(code.slice(0, 3));
  const out = { code, code_int, n_press };
  console.log(out);
  return out;
};

const solve = (txt: string, n_pad: number) => {
  const codes = read_input(txt);
  const score = d3.sum(
    codes.slice(0, 100).map((e) => calc_code(e, n_pad)).map((e) =>
      e.code_int * e.n_press
    ),
  );
  return score;
};

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("21-test.txt");

  const n_pad = 2;
  const score = solve(txt, n_pad);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("21.txt");

  const n_pad = 2;
  const score = solve(txt, n_pad);
  console.log({ score });
}

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("run-2");
  const txt = u.read_txt_file("21.txt");

  const n_pad = 25;
  const score = solve(txt, n_pad);
  console.log({ score });
}
