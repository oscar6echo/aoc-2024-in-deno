import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 1");

const txt = u.read_txt_file("1.txt");

const input = d3.csvParseRows(txt, (e: string[]) => {
  const x = e[0].split(" ").filter((e) => !!e).map((e) => parseInt(e));
  return { a: x[0], b: x[1] };
});

const a = input.map((e) => e.a).sort();
const b = input.map((e) => e.b).sort();
const n = input.length;

console.log({ input, n });

let diff = 0;
for (const i of d3.range(n)) {
  const _diff = Math.abs(a[i] - b[i]);
  diff += _diff;
}

console.log({ diff });

let similarity = 0;
for (const i of d3.range(n)) {
  const n_occur = b.filter((x) => x === a[i]).length;
  similarity += a[i] * n_occur;
}

console.log({ similarity });
