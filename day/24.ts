import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 24");

type InitState = {
  [gate: string]: boolean;
};

type Gate = {
  gate_in_1: string;
  gate_in_2: string;
  operation: string;
  gate_out: string;
};

type Input = {
  init: InitState;
  logic: Gate[];
};

type GateInput = {
  gate_in_1: string;
  gate_in_2: string;
  operation: string;
  value: boolean | undefined;
};

type DicGate = {
  [gate: string]: GateInput;
};

type System = {
  init: InitState;
  gates: DicGate;
};

type OutGate = {
  gate: string;
  value: boolean;
};

//////////////////////////

const read_input = (txt: string) => {
  const a = txt.split("\n\n");
  assert(a.length === 2);
  const [_init, _logic] = a;

  const init = Object.fromEntries(
    _init.split("\n").map((e) => {
      const a = e.split(": ").map((f) => f.trim());
      assert(a.length === 2);
      const [gate, val] = a;
      return [gate, Boolean(parseInt(val))];
    }),
  );

  const logic = _logic.split("\n").map((e) => {
    const a = e.split(" ").map((f) => f.trim());
    assert(a.length === 5);
    assert(a[3] === "->");
    const [gate_in_1, operation, gate_in_2, _, gate_out] = a;
    return { gate_in_1, operation, gate_in_2, gate_out };
  });

  const input: Input = { init, logic };

  return input;
};

const build_system = (input: Input) => {
  const { init, logic } = input;

  const gates: DicGate = {};

  logic.forEach((e) => {
    const { gate_in_1, gate_in_2, operation, gate_out } = e;
    assert(!gates[gate_out]);
    gates[gate_out] = {
      gate_in_1,
      gate_in_2,
      operation,
      value: undefined,
    };
  });

  const system: System = { init, gates };
  return system;
};

const run_op = (val_1: boolean, val_2: boolean, operation: string) => {
  if (operation === "AND") {
    return val_1 && val_2;
  } else if (operation === "OR") {
    return val_1 || val_2;
  } else if (operation === "XOR") {
    return (val_1 && !val_2) || (!val_1 && val_2);
  } else {
    throw Error("UNEXPECTED");
  }
};

const get_gate_value = (system: System, gate: string) => {
  if (gate.startsWith("x") || gate.startsWith("y")) {
    return system.init[gate];
  } else {
    return system.gates[gate].value;
  }
};

const run_system = (system: System) => {
  let last_n_undef = Infinity;

  let c = 0;
  while (true) {
    c += 1;
    const done = Object.entries(system.gates)
      .filter(([k, _v]) => k.startsWith("z"))
      .map(([_k, v]) => v.value !== undefined)
      .every((e) => !!e);

    if (done) {
      break;
    }

    Object.entries(system.gates).forEach(([k, v]) => {
      const { gate_in_1, gate_in_2, operation } = v;

      const val_1 = get_gate_value(system, gate_in_1);
      const val_2 = get_gate_value(system, gate_in_2);
      if (
        system.gates[k].value === undefined &&
        val_1 !== undefined &&
        val_2 !== undefined
      ) {
        const val_out = run_op(val_1, val_2, operation);
        system.gates[k].value = val_out;
      }
    });

    const n_undef = Object.values(system.gates)
      .map((e) => e.value)
      .filter((e) => e === undefined).length;

    if (n_undef === last_n_undef) {
      // console.log("LOOP -> ABORT");
      return { gates: [], score: -1n };
    }

    last_n_undef = n_undef;
  }

  const gates: OutGate[] = Object.entries(system.gates)
    .filter(([k, _v]) => k.startsWith("z"))
    .map(([k, v]) => {
      assert(v.value !== undefined);
      return { gate: k, value: v.value };
    });

  assert(gates.every((e) => e !== undefined));

  const score = gates
    .toSorted((a: OutGate, b: OutGate) => d3.ascending(a.gate, b.gate))
    .map((e, i) => e.value ? 1n << BigInt(i) : 0n)
    .reduce((acc, v) => {
      acc += v;
      return acc;
    }, 0n);

  return { gates, score };
};

const solve_1 = (input: Input) => {
  const system = build_system(input);
  return run_system(system);
};

const build_init = (x: bigint, y: bigint) => {
  const x_bin = x.toString(2).padStart(2, "0").split("").toReversed().join("");
  const y_bin = y.toString(2).padStart(2, "0").split("").toReversed().join("");

  const x_arr = x_bin.split("").map((e, i) => {
    const key = `x${String(i).padStart(2, "0")}`;
    const val = Boolean(parseInt(e));
    return [key, val];
  });

  const y_arr = y_bin.split("").map((e, i) => {
    const key = `y${String(i).padStart(2, "0")}`;
    const val = Boolean(parseInt(e));
    return [key, val];
  });

  const init = Object.fromEntries([...x_arr, ...y_arr]);

  return init;
};

const merge_init = (init: InitState, system: System, reset = true) => {
  const init_out: InitState = Object.fromEntries(
    Object.entries(system.init).map(([k, v]) => {
      if (init[k]) {
        return [k, init[k]];
      } else if (reset) {
        return [k, false];
      } else {
        return [k, v];
      }
    }),
  );
  return init_out;
};

const run_system_2 = (x: bigint, y: bigint, system: System) => {
  const init = build_init(x, y);
  const _system = u.clone(system);
  _system.init = merge_init(init, system);
  const { score } = run_system(_system);
  const test = x + y === score;
  return test;
};

const swap_gates = (gate_1: string, gate_2: string, system: System) => {
  const tmp = u.clone(system.gates[gate_1]);
  system.gates[gate_1] = u.clone(system.gates[gate_2]);
  system.gates[gate_2] = tmp;
};

const solve_2a = (input: Input) => {
  const system = build_system(input);

  const nodes_z = ["z18", "z10", "z33"];
  const nodes_u = ["qgd", "mwk", "gqp"];

  assert(nodes_u.length === nodes_z.length);

  const perms = u.permutations(nodes_u);
  const swaps = perms.map((p) => nodes_z.map((e, i) => [e, p[i]]));

  console.log(swaps);

  for (const swap of swaps) {
    const _system = u.clone(system);
    console.log({ swap });

    for (const s of swap) {
      swap_gates(s[0], s[1], _system);
    }

    for (const i of d3.range(44)) {
      const _i = BigInt(i);

      const x = BigInt(0n);
      const y = BigInt(1n << _i);
      const test = run_system_2(x, y, _system);
      console.log({ i, x, y, test });
    }
  }
};

const solve_2b = (input: Input) => {
  const system = build_system(input);

  // from pattern observations on 24-sorted.txt
  const swaps = [["z18", "qgd"], ["z10", "mwk"], ["z33", "gqp"]];
  console.log(swaps);

  for (const s of swaps) {
    swap_gates(s[0], s[1], system);
  }

  for (const i of d3.range(44)) {
    const _i = BigInt(i);

    const x = BigInt(0n);
    const y = BigInt(1n << _i);
    const test = run_system_2(x, y, system);
    console.log({ i, x, y, test });
  }

  // z24
  const node_and = "jmh";

  const sel_xor_xy = Object.entries(system.gates).filter(([_k, v]) => {
    return v.operation === "XOR" &&
      (v.gate_in_1.startsWith("x") || v.gate_in_1.startsWith("y")) &&
      (v.gate_in_2.startsWith("x") || v.gate_in_2.startsWith("y"));
  }).map(([k, _v]) => k).toSorted().filter((e) => !e.startsWith("z"));
  console.log({ sel_xor_xy, n: sel_xor_xy.length });

  for (const e of sel_xor_xy) {
    swap_gates(node_and, e, system);
    /// random test
    const x = BigInt(351843720882n);
    const y = BigInt(789654312n);
    const test = run_system_2(x, y, system);
    console.log({ a: node_and, b: e, test });
    if (test) {
      console.log("candidate", { a: node_and, b: e });
    }
    swap_gates(node_and, e, system);
  }
};

const solve_2c = (input: Input) => {
  const system = build_system(input);

  const swaps = [
    ["z18", "qgd"],
    ["z10", "mwk"],
    ["z33", "gqp"],
    // from solve_2b
    // ["jmh", "tff"], // nope
    ["jmh", "hsw"],
  ];
  console.log(swaps);
  const swap_str = swaps.flat().toSorted().join(",");
  console.log(swap_str);

  for (const s of swaps) {
    swap_gates(s[0], s[1], system);
  }

  for (const i of d3.range(44)) {
    const _i = BigInt(i);

    const x = BigInt(0n);
    const y = BigInt(1n << _i);
    const test = run_system_2(x, y, system);
    console.log({ i, x, y, test });
  }

  console.log();

  for (const i of d3.range(100)) {
    const rnd = () => BigInt(Math.floor(Math.random() * (1 << 26)));
    const x = rnd();
    const y = rnd();
    const test = run_system_2(x, y, system);
    console.log({ i, x, y, test });
    if (!test) {
      console.log("INVALID");
    }
  }

  return swap_str;
};

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("24-test-a.txt");
  const input = read_input(txt);
  const { score } = solve_1(input);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("test-1b");
  const txt = u.read_txt_file("24-test-b.txt");
  const input = read_input(txt);
  const { score } = solve_1(input);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("24.txt");
  const input = read_input(txt);
  const { score } = solve_1(input);
  console.log({ score });
}

////////////////// 2

{
  console.log("=".repeat(50));
  console.log("run-2");
  const txt = u.read_txt_file("24.txt");
  const input = read_input(txt);
  console.log("-".repeat(20), "solve_2a");
  solve_2a(input);
  console.log("-".repeat(20), "solve_2b");
  solve_2b(input);
  console.log("-".repeat(20), "solve_2c");
  const solution = solve_2c(input);
  console.log({ solution });
}
