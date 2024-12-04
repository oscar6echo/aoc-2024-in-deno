import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 3");

const txt = u.load_tvs_file("3.txt");
console.log({ txt });

/////////////////// test-1
const pattern_1 = /mul\((\d+),(\d+)\)/g;

const test_input_1 =
  "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";
console.log({ test_input_1 });

const test_muls_1 = test_input_1.matchAll(pattern_1).map((e) => {
  //   console.log(e);
  return e;
}).map((e) => [...e]).map((e) => {
  console.log(e);

  const out = {
    a: parseInt(e[1]),
    b: parseInt(e[2]),
  };
  console.log(out);
  return out;
}).map((e) => e.a * e.b);

const test_result_1 = d3.sum(test_muls_1);
console.log({ test_result_1 });

///////////////// run-1

const input = txt;

const muls = input.matchAll(pattern_1).map((e) => {
  //   console.log(e);
  return e;
}).map((e) => [...e]).map((e) => {
  //   console.log(e);

  const out = {
    a: parseInt(e[1]),
    b: parseInt(e[2]),
  };
  //   console.log(out);
  return out;
}).map((e) => e.a * e.b);

const result = d3.sum(muls);
console.log({ result });

/////////////////// test-2
const pattern_2 = /(mul\((\d+),(\d+)\))|((do\(\)|don't\(\)))/g;

const test_input_2 =
  "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";
console.log({ test_input_2 });

const test_muls_2a = test_input_2.matchAll(pattern_2).map((e) => {
  //   console.log(e);
  return e;
}).map((e) => [...e]).map((e) => {
  const out = {
    expr: e[0],
    a: parseInt(e[2]),
    b: parseInt(e[3]),
  };

  console.log(out);
  return out;
}).map((e) => e);

const test_muls_2b: {
  expr: string;
  a: number;
  b: number;
}[] = [];

let on = true;
test_muls_2a.forEach((e) => {
  if (e.expr === "don't()") {
    on = false;
  } else if (e.expr === "do()") {
    on = true;
  }
  if (on && e.expr.startsWith("mul")) {
    test_muls_2b.push(e);
  }
});

const test_result_2 = d3.sum(test_muls_2b.map((e) => e.a * e.b));

console.log({ test_muls_2b, test_result_2 });

///////////////// run-1

const muls_2a = input.matchAll(pattern_2).map((e) => {
  //   console.log(e);
  return e;
}).map((e) => [...e]).map((e) => {
  const out = {
    expr: e[0],
    a: parseInt(e[2]),
    b: parseInt(e[3]),
  };

  //   console.log(out);
  return out;
}).map((e) => e);

const muls_2b: {
  expr: string;
  a: number;
  b: number;
}[] = [];

on = true;
muls_2a.forEach((e) => {
  if (e.expr === "don't()") {
    on = false;
  } else if (e.expr === "do()") {
    on = true;
  }
  if (on && e.expr.startsWith("mul")) {
    muls_2b.push(e);
  }
});

const result_2 = d3.sum(muls_2b.map((e) => e.a * e.b));

console.log({ result_2 });
