import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 7");

type Line = {
  input: number[];
  output: number;
};

const build_lines = (txt: string): Line[] => {
  const arr = txt.split("\n").filter((e) => e !== "").map((e) => {
    const s = e.split(":");
    return {
      output: parseInt(s[0]),
      input: s[1].split(" ").filter((x) => x !== "").map((x) => parseInt(x)),
    };
  });

  return arr;
};

const build_arr_operations = (n_op: number, operators: string[]) => {
  const build = (arr_seq_in: string[][]) => {
    const arr_seq_out: string[][] = [];

    if (arr_seq_in.length === 0) {
      for (const op of operators) {
        const seq_new: string[] = [];
        seq_new.push(op);
        arr_seq_out.push(seq_new);
      }
    } else {
      for (const seq of arr_seq_in) {
        for (const op of operators) {
          const seq_new = [...seq];
          seq_new.push(op);
          arr_seq_out.push(seq_new);
        }
      }
    }

    return arr_seq_out;
  };

  let arr_seq: string[][] = [];

  for (const _i of d3.range(n_op)) {
    arr_seq = build(arr_seq);
  }

  return arr_seq;
};

const compute_line = (input: number[], arr_operation: string[]) => {
  assert(input.length - 1 === arr_operation.length);

  let res = input[0];
  for (const i of d3.range(1, input.length)) {
    const op = arr_operation[i - 1];
    if (op === "+") {
      res += input[i];
    } else if (op === "*") {
      res *= input[i];
    } else if (op === "||") {
      res = parseInt(String(res) + String(input[i]));
    } else {
      throw Error("UNEXPECTED");
    }
  }
  return res;
};

const solve_line = (line: Line, operators: string[]) => {
  const seq_arr_operation = build_arr_operations(
    line.input.length - 1,
    operators,
  );

  for (const arr_operation of seq_arr_operation) {
    const calc = compute_line(line.input, arr_operation);
    if (calc === line.output) return true;
  }

  return false;
};

const solve_file = (lines: Line[], operators: string[]) => {
  let res = 0;

  for (const line of lines) {
    const is_solved = solve_line(line, operators);
    if (is_solved) {
      res += line.output;
    }
  }

  return res;
};

//////////////// 1

{
  console.log("test-1");
  const operators = ["+", "*"];
  const txt = u.read_txt_file("7-test.txt");
  const arr = build_lines(txt);
  console.log({ arr });

  const res = solve_file(arr, operators);
  console.log({ res });
}

{
  console.log("run-1");
  const operators = ["+", "*"];
  const txt = u.read_txt_file("7.txt");
  const arr = build_lines(txt);

  const res = solve_file(arr, operators);
  console.log({ res });
}

// //////////////// 2

{
  console.log("test-2");
  const operators = ["+", "*", "||"];
  const txt = u.read_txt_file("7-test.txt");
  const arr = build_lines(txt);
  console.log({ arr });

  const res = solve_file(arr, operators);
  console.log({ res });
}

{
  console.log("run-2");
  const operators = ["+", "*", "||"];
  const txt = u.read_txt_file("7.txt");
  const arr = build_lines(txt);

  const res = solve_file(arr, operators);
  console.log({ res });
}
