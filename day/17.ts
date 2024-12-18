import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 17");

type Register = {
  A: number;
  B: number;
  C: number;
};

type Program = number[];
type Output = number[];

type State = {
  register: Register;
  program: Program;
  pointer: number;
  output: Output;
};

const build_init_state = (
  A: number,
  B: number,
  C: number,
  program: number[],
) => {
  const state: State = {
    register: { A, B, C },
    program,
    pointer: 0,
    output: [],
  };
  return state;
};

const read_input = (txt: string) => {
  const regex_register = /Register\s([ABC]):\s(\d+)/g;
  const regex_program = /Program:\s(.+)/g;

  const input: State = {
    register: { A: 0, B: 0, C: 0 },
    program: [],
    pointer: 0,
    output: [],
  };

  txt.split("\n\n").filter((e) => e !== "").map((e, i) => {
    if (i === 0) {
      const f = e.split("\n");
      assert(f.length === 3);

      let x = f[0];
      let arr = [...x.matchAll(regex_register)];
      input.register.A = parseInt(arr[0][2]);

      x = f[1];
      arr = [...x.matchAll(regex_register)];
      input.register.B = parseInt(arr[0][2]);

      x = f[2];
      arr = [...x.matchAll(regex_register)];
      input.register.C = parseInt(arr[0][2]);
    } else if (i === 1) {
      const arr = [...e.matchAll(regex_program)];
      input.program = arr[0][1].split(",").map((x) => parseInt(x));
      assert(input.program.length % 2 === 0);
    }
  });

  return input;
};

const get_combo_operand = (i: number, state: State) => {
  if (i < 0 || i > 7) {
    throw Error("UNEXPECTED");
  }

  if (i === 7) {
    throw Error("INVALID PROGRAM");
  }

  const out = i >= 0 && i <= 3
    ? i
    : i === 4
    ? state.register.A
    : i === 5
    ? state.register.B
    : i === 6
    ? state.register.C
    : -1;

  assert(out !== -1);
  return out;
};

const run_op = (state: State, verbose = true) => {
  if (state.pointer >= state.program.length) {
    if (verbose) {
      console.log("END OF PROGRAM: HALT");
    }
    return false;
  }

  const p = state.pointer;
  const opcode = state.program[p];
  const operand = state.program[p + 1];
  if (verbose) {
    console.log("run_op", { pointer: p, opcode, operand });
  }

  if (opcode === 0) {
    // adv
    const num = state.register.A;
    const combo_operand = get_combo_operand(operand, state);
    const denom = Math.pow(2, combo_operand);
    // console.log({ denom });
    const res = Math.floor(num / denom);
    state.register.A = res;
  } else if (opcode === 1) {
    // bxl
    // warning - JS trims to 32b
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR
    const res = Number(BigInt(state.register.B) ^ BigInt(operand));
    state.register.B = res;
  } else if (opcode === 2) {
    // bst
    const combo_operand = get_combo_operand(operand, state);
    const res = combo_operand % 8;
    state.register.B = res;
  } else if (opcode === 3) {
    // jnz
    if (state.register.A !== 0) {
      state.pointer = operand;
      return true;
    }
  } else if (opcode === 4) {
    // bxc
    // warning - JS trims to 32b
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR
    const res = Number(BigInt(state.register.B) ^ BigInt(state.register.C)); // warning
    state.register.B = res;
  } else if (opcode === 5) {
    // out
    const combo_operand = get_combo_operand(operand, state);
    const res = combo_operand % 8;
    state.output.push(res);
    console.log(state.output);
  } else if (opcode === 6) {
    // bdv
    const num = state.register.A;
    const combo_operand = get_combo_operand(operand, state);
    const res = Math.floor(num / Math.pow(2, combo_operand));
    state.register.B = res;
  } else if (opcode === 7) {
    // cdv
    const num = state.register.A;
    const combo_operand = get_combo_operand(operand, state);
    const res = Math.floor(num / Math.pow(2, combo_operand));
    state.register.C = res;
  } else {
    throw Error("UNEXPECTED");
  }

  state.pointer += 2;
  return true;
};

const run_program = (state: State, verbose = true) => {
  while (true) {
    const again = run_op(state, verbose);

    if (!again) {
      break;
    }
  }
};

const run_program_2 = (state: State, verbose = false) => {
  const r = state.register;

  let a = BigInt(r.A);
  let o = BigInt(0);
  const out: bigint[] = [];

  while (a !== 0n) {
    [a, o] = run_seq_2(a, verbose);

    out.push(o);
  }

  r.A = Number(a);
  state.output = out.map((e) => Number(e));
};

const run_seq_2 = (
  a: bigint,
  // b: bigint, c: bigint,
  verbose = false,
) => {
  /** convert program step as bit operations
   * notice than
   *    only input is a
   *    only lowest bits of a matter
   */

  let b = 0n;
  let c = 0n;

  if (verbose) {
    console.log("---0", { a, b, c });
  }
  b = a & 7n;
  if (verbose) {
    console.log("---1", { a, b, c });
  }
  b = b ^ 2n;
  if (verbose) {
    console.log("---2", { a, b, c });
  }
  c = a >> b; // int div by 2**B
  if (verbose) {
    console.log("---3", { a, b, c });
  }
  b = b ^ c;
  if (verbose) {
    console.log("---4", { a, b, c });
  }
  a = a >> 3n; // int div by 8
  if (verbose) {
    console.log("---5", { a, b, c });
  }
  b = b ^ 7n;
  if (verbose) {
    console.log("---6", { a, b, c });
  }
  const o = b & 7n;
  if (verbose) {
    console.log("---7", { a, b, c, o });
  }
  return [a, o];
};

const search_2 = (state: State) => {
  /** search for smallest a
   *  backwards from last output to first
   *  based on run_seq_2 bit operations
   */
  const target = state.program.map((e) => BigInt(e));
  target.reverse();

  const N = 16;
  assert(target.length === N);

  const search_rec = (prev: bigint, level: number) => {
    const _target = target[level];

    for (const i of d3.range(8)) {
      const a = (prev << 3n) + BigInt(i);
      const [_a, o] = run_seq_2(a);

      if (o === _target) {
        if (level === N - 1) {
          return a;
        } else {
          return search_rec(a, level + 1);
        }
      }
    }
    return null;
  };

  const x = search_rec(0n, 0);
  return x;
};

//////////////// 1

// basic tests
const do_tests = true;

if (do_tests) {
  {
    console.log("=".repeat(50));
    const state = build_init_state(0, 0, 9, [2, 6]);
    run_program(state);
    assert(state.register.B === 1);
    console.log("OK");
  }
  {
    console.log("=".repeat(50));
    const state = build_init_state(10, 0, 0, [5, 0, 5, 1, 5, 4]);
    run_program(state);
    assert(state.output.join(",") === "0,1,2");
    console.log("OK");
  }
  {
    console.log("=".repeat(50));
    const state = build_init_state(2024, 0, 0, [0, 1, 5, 4, 3, 0]);
    run_program(state);
    assert(state.register.A === 0);
    assert(state.output.join(",") === "4,2,5,6,7,7,7,7,3,1,0");
    console.log("OK");
  }
  {
    console.log("=".repeat(50));
    const state = build_init_state(0, 29, 0, [1, 7]);
    run_program(state);
    assert(state.register.B === 26);
    console.log("OK");
  }
  {
    console.log("=".repeat(50));
    const state = build_init_state(0, 2024, 43690, [4, 0]);
    run_program(state);
    assert(state.register.B === 44354);
    console.log("OK");
  }
  console.log("\n");
}

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("17-test.txt");
  const state = read_input(txt);
  console.log({ state });
  run_program(state);
  console.log({ output: state.output });
  assert(state.output.join(",") === "4,6,3,5,6,3,5,2,1,0");
  console.log("OK");
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("17.txt");
  const state = read_input(txt);
  console.log({ state });
  run_program(state);
  console.log({ output: state.output });
  console.log("output:", state.output.join(","));
}

{
  // test run_program_2
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("17.txt");
  const state = read_input(txt);
  console.log({ state });
  run_program_2(state);
  console.log({ output: state.output });
  console.log("output:", state.output.join(","));
}

////////////////// 2

{
  console.log("=".repeat(50));
  console.log("run-2");
  const txt = u.read_txt_file("17.txt");
  const state = read_input(txt);
  const a = search_2(state);
  console.log({ solution: a });

  state.register.A = Number(a);
  console.log({ state });
  run_program_2(state);
  console.log({ state });
  assert(state.output.join(",") === state.program.join(","));
  console.log("OK: program = output =", state.output.join(","));
}
