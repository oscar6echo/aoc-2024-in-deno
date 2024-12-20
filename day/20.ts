import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 20");

type Pos = {
  x: number;
  y: number;
};

type Size = {
  x: number;
  y: number;
};

type Floor = {
  area: string[][];
  size: Size;
  start: Pos;
  end: Pos;
};

type Node = Pos;

const read_input = (txt: string) => {
  const area = txt.split("\n").map((e) =>
    e.split("").map((f) => f.trim()).filter((f) => f !== "")
  ).filter((e) => e.length > 0);
  const size = { x: area[0].length, y: area.length };

  const get_pos_char = (arr: string[][], char: string) => {
    const _i = arr.flat().findIndex((e) => e === char);
    const size_x = arr[0].length;
    const pos = {
      x: _i % size_x,
      y: Math.floor(_i / size_x),
    };
    return pos;
  };

  const start = get_pos_char(area, "S");
  const end = get_pos_char(area, "E");

  return { area, size, start, end } as Floor;
};

const show_floor = (floor: Floor, path: string[]) => {
  const set = (arr: string[][], pos: Pos) => arr[pos.y][pos.x] = "O";

  const { area } = u.clone(floor);
  path.forEach((e) => {
    const pos = unstr_node(e);
    set(area, pos);
  });

  console.log("");
  area.forEach((r) => {
    const r_str = r.join("");
    console.log(r_str);
  });
  console.log("");
};

const str_node = (a: Node) => `${a.x}-${a.y}`;
const unstr_node = (s: string): Pos => {
  const arr = s.split("-");
  return { x: parseInt(arr[0]), y: parseInt(arr[1]) };
};

const left = (pos: Pos): Pos => ({ x: pos.x - 1, y: pos.y });
const right = (pos: Pos): Pos => ({ x: pos.x + 1, y: pos.y });
const up = (pos: Pos): Pos => ({ x: pos.x, y: pos.y - 1 });
const down = (pos: Pos): Pos => ({ x: pos.x, y: pos.y + 1 });
const is_same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;

const build_get = (floor: Floor) => {
  const get = (pos: Pos) => {
    if (
      pos.y >= 0 && pos.y < floor.size.y && pos.x >= 0 && pos.x < floor.size.x
    ) {
      return floor.area[pos.y][pos.x];
    }
    return null;
  };
  return get;
};

const build_path = (floor: Floor) => {
  /** know it's a single path => not a real search */
  const get = build_get(floor);
  const is_valid = (pos: Pos) => [".", "E"].includes(get(pos) || "");

  const path: Pos[] = [floor.start];

  while (true) {
    const last = path[path.length - 1];
    if (is_same(last, floor.end)) {
      break;
    }

    const pos_up = up(last);
    const pos_right = right(last);
    const pos_down = down(last);
    const pos_left = left(last);
    const arr_pos = [pos_up, pos_right, pos_down, pos_left]
      .filter((e) => is_valid(e));

    let found = false;
    for (const pos of arr_pos) {
      const is_in_path = path.find((e) => is_same(e, pos)) !== undefined;
      if (!is_in_path) {
        path.push(pos);
        found = true;
        break;
      }
    }
    if (found) {
      continue;
    }

    throw Error("UNEXPECTED");
  }

  return path;
};

const teleport = (floor: Floor, pos: Pos, distance: number) => {
  const get = build_get(floor);
  const is_valid = (pos: Pos) => [".", "E"].includes(get(pos) || "");

  const ends: [Pos, number][] = [];

  d3.range(0, distance + 1).forEach((x) => {
    d3.range(0, distance + 1).forEach((y) => {
      const d = x + y;
      if (d > 0 && d <= distance) {
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sign_x, sign_y]) => {
          const end: Pos = { x: pos.x + sign_x * x, y: pos.y + sign_y * y };
          if (is_valid(end)) {
            ends.push([end, d]);
          }
        });
      }
    });
  });

  return ends;
};

const solve = (txt: string, distance: number, show = true) => {
  const t0 = new Date();
  const floor = read_input(txt);
  if (show) show_floor(floor, []);

  const path_ref = build_path(floor);
  const path_ref_str = path_ref.map((e) => str_node(e));
  const n_pico_ref = path_ref.length - 1;
  console.log({ n_pico_ref });

  // lookup table
  const dic_str_idx = Object.fromEntries(
    path_ref_str.map((e, i) => [e, i]),
  );

  const dic_cheat_gain: { [cheat: string]: number } = {};

  path_ref.forEach((start) => {
    const arr_end = teleport(floor, start, distance);
    arr_end.forEach(([end, d]) => {
      const start_str = str_node(start);
      const end_str = str_node(end);
      const i_start = dic_str_idx[start_str];
      const i_end = dic_str_idx[end_str];
      const gain = (i_end - i_start) - d;
      if (gain > 0) {
        const cheat_id = `${start_str}|${end_str}`;
        dic_cheat_gain[cheat_id] = gain;
      }
    });
  });

  if (show) {
    console.log({ dic_cheat_gain });
  }

  const solutions: { [gain: number]: number } = {};
  Object.entries(dic_cheat_gain).forEach(([_k, v]) => {
    if (!solutions[v]) solutions[v] = 0;
    solutions[v] += 1;
  });

  if (show) {
    console.log({ solutions });
  }

  const score = d3.sum(
    Object.entries(solutions)
      .filter(([k, _v]) => parseInt(k) >= 100).map(([_k, v]) => v),
  );

  const t1 = new Date();
  const runtime = (t1.getTime() - t0.getTime()) / 1000;
  console.log(`runtime: ${runtime} s`);

  return score;
};

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("20-test.txt");

  const distance = 2;
  const score = solve(txt, distance, true);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("20.txt");

  const distance = 2;
  const score = solve(txt, distance, false);
  console.log({ score });
}

////////////////// 2

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("20-test.txt");

  const distance = 20;
  const score = solve(txt, distance, false);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("20.txt");

  const distance = 20;
  const score = solve(txt, distance, false);
  console.log({ score });
}
