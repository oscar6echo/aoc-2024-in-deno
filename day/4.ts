// import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 3");

const txt = u.read_txt_file("4-test.txt");
console.log({ txt });

/////////////////// test-1

const arr = txt.split("\n").map((e) => e.split(""));
console.log({ n: arr.length, m: arr[0].length });

console.log({
  arr,
  n: arr.length,
  m: arr[0].length,
});
