import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 13");

type Button = {
  name: string;
  cost: number;
  add_x: number;
  add_y: number;
};

type Prize = {
  x: number;
  y: number;
};

type Machine = {
  button_a: Button;
  button_b: Button;
  prize: Prize;
};

type Solution = {
  a: number;
  b: number;
};

const read_input = (txt: string, add_to_prize = 0): Machine[] => {
  const regex_button = /Button\s([AB]):\sX\+(\d+),\sY\+(\d+)/g;
  const regex_prize = /Prize:\sX=(\d+),\sY=(\d+)/g;

  const arr = txt.split("\n\n").map((e) => {
    const parsed = e.split("\n").filter((f) => f !== "").map((f) => {
      //   console.log({ f });
      if (f.startsWith("Button ")) {
        const arr = [...f.matchAll(regex_button)];
        // console.log({ arr });
        const name = arr[0][1];
        const add_x = parseInt(arr[0][2]);
        const add_y = parseInt(arr[0][3]);
        const cost = name === "A" ? 3 : name === "B" ? 1 : 0;
        assert(cost > 0);
        return { name, add_x, add_y, cost } as Button;
      } else if (f.startsWith("Prize: ")) {
        const arr = [...f.matchAll(regex_prize)];
        // console.log({ arr });
        const x = parseInt(arr[0][1]);
        const y = parseInt(arr[0][2]);
        return { x: x + add_to_prize, y: y + add_to_prize } as Prize;
      } else {
        throw Error("UNEXPECTED");
      }
    });

    const button_a = parsed[0] as unknown as Button;
    const button_b = parsed[1] as unknown as Button;
    const prize = parsed[2] as unknown as Prize;

    const machine: Machine = {
      button_a,
      button_b,
      prize,
    };
    return machine;
  });

  return arr;
};

const calc_cost = (s: Solution) => {
  return 3 * s.a + s.b;
};

const solve_machine = (m: Machine) => {
  const x_a = m.button_a.add_x;
  const y_a = m.button_a.add_y;

  const x_b = m.button_b.add_x;
  const y_b = m.button_b.add_y;

  const prize_x = m.prize.x;
  const prize_y = m.prize.y;

  // exact solve - max one solution

  const denom_a = x_a * y_b - y_a * x_b;
  assert(denom_a !== 0);
  const a = (prize_x * y_b - prize_y * x_b) / denom_a;

  const denom_b = x_b * y_a - y_b * x_a;
  assert(denom_b !== 0);
  const b = (prize_x * y_a - prize_y * x_a) / denom_b;

  //   console.log({ a, b });
  //   console.log("a", a * x_a + b * x_b);
  //   console.log("a * x_a + b * x_b", a * x_a + b * x_b);
  //   console.log("prize_x", prize_x);
  //   console.log("a * y_a + b * y_b", a * y_a + b * y_b);
  //   console.log("prize_y", prize_y);

  const epsilon = 1e-2; // anything larger fails - JS precision is poor
  assert(Math.abs((a * x_a + b * x_b) - prize_x) < epsilon);
  assert(Math.abs(a * y_a + b * y_b - prize_y) < epsilon);

  // check if solution is valid ie integer
  if (Number.isInteger(a) && Number.isInteger(b)) {
    const cost = calc_cost({ a, b });
    return cost;
  } else {
    return null;
  }
};

const solve = (machines: Machine[]) => {
  const costs = machines.map((e) => solve_machine(e)).filter((e) => e !== null);
  console.log({ costs, n_found: costs.length });
  const total = d3.sum(costs);
  return total;
};

//////////////// 1

{
  console.log("test-1");
  const txt = u.read_txt_file("13-test.txt");

  const machines = read_input(txt);
  console.log({ machines, n_machine: machines.length });

  const cost = solve(machines);
  console.log({ cost });
}

{
  console.log("run-1");
  const txt = u.read_txt_file("13.txt");

  const machines = read_input(txt);
  console.log({ n_machine: machines.length });

  const cost = solve(machines);
  console.log({ cost });
}

//////////////// 2

{
  console.log("test-2");
  const txt = u.read_txt_file("13-test.txt");

  const machines = read_input(txt, 10000000000000);
  console.log({ machines, n_machine: machines.length });

  const cost = solve(machines);
  console.log({ cost });
}

{
  console.log("run-2");
  const txt = u.read_txt_file("13.txt");

  const machines = read_input(txt, 10000000000000);
  console.log({ n_machine: machines.length });

  const cost = solve(machines);
  console.log({ cost });
}
