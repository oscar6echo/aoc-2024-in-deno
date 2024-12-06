import { assert } from "@std/assert/assert";
import u from "./shared/util.ts";

console.log("START 6");

type Pos = {
  v: number; // vertical down
  h: number; // horizontal right
};

const directions = [
  [-1, 0], //up
  [0, 1], // right
  [1, 0], // down
  [0, -1], // left
];

const get_start = (arr: string[][]) => {
  const start_v = arr.findIndex((e) => e.includes("^"));
  const start_h = arr[start_v].findIndex((e) => e === "^");
  const start = [start_v, start_h];
  return start;
};

const is_outside = (pos: Pos, arr_input: string[][]) => {
  const n = arr_input.length;
  const m = arr_input[0].length;
  return pos.v < 0 || pos.v >= n || pos.h < 0 || pos.h >= m;
};
const is_obstacle = (pos: Pos, arr: string[][]) => {
  return arr[pos.v][pos.h] === "#";
};
const next_pos = (pos: Pos, dir: number): Pos => {
  return {
    v: pos.v + directions[dir][0],
    h: pos.h + directions[dir][1],
  };
};

const turn_right = (dir: number) => {
  return (dir + 1) % 4;
};

const str_pos_dir = (pos: Pos, dir: number) => {
  return `${pos.v}-${pos.h}-${dir}`;
};
const str_pos = (pos: Pos) => {
  return `${pos.v}-${pos.h}`;
};
const rev_str_pos = (s: string) => {
  const [v, h] = s.split("-");
  return { v: parseInt(v), h: parseInt(h) };
};

const walk_guard_path = (arr: string[][], start: number[]) => {
  /** */

  let pos = { v: start[0], h: start[1] };
  let dir = 0;

  const visited_pos = new Set<string>();
  const visited_pos_dir = new Set<string>();

  while (true) {
    if (visited_pos_dir.has(str_pos_dir(pos, dir))) {
      return { n_visited_pos: null, is_loop: true };
    }

    visited_pos_dir.add(str_pos_dir(pos, dir));
    visited_pos.add(str_pos(pos));

    const _candidate_pos = next_pos(pos, dir);
    if (is_outside(_candidate_pos, arr)) {
      break;
    }
    if (is_obstacle(_candidate_pos, arr)) {
      dir = turn_right(dir);
    } else {
      pos = next_pos(pos, dir);
    }
  }

  const n_visited_pos = visited_pos.size;

  return { n_visited_pos, is_loop: false, visited_pos };
};

const search_for_guard_loops = (
  arr: string[][],
  visited: Set<string>,
  start: number[],
) => {
  const _visited = ([...visited].map((e) => rev_str_pos(e)) as Pos[]).filter(
    (e) => !(e.v === start[0] && e.h === start[1]),
  );

  let n_loop = 0;
  for (const _pos of _visited) {
    const _arr = u.clone(arr);
    _arr[_pos.v][_pos.h] = "#";

    const { is_loop } = walk_guard_path(_arr, start);
    if (is_loop) {
      n_loop += 1;
      //   console.log(n_loop);
    }
  }

  return n_loop;
};

//////////////// test

{
  console.log("test-1");
  const txt = u.read_txt_file("6-test.txt");
  const arr = txt.split("\n").map((e) => e.split(""));
  const start = get_start(arr);

  const { n_visited_pos, is_loop, visited_pos } = walk_guard_path(arr, start);
  assert(visited_pos !== undefined);
  console.log({ n_visited_pos, is_loop });

  console.log("test-2");
  const n_loop = search_for_guard_loops(arr, visited_pos, start);
  console.log({ n_loop });
}

// //////////////// run

{
  console.log("test-1");
  const txt = u.read_txt_file("6.txt");
  const arr = txt.split("\n").map((e) => e.split(""));
  const start = get_start(arr);

  const { n_visited_pos, is_loop, visited_pos } = walk_guard_path(arr, start);
  assert(visited_pos !== undefined);
  console.log({ n_visited_pos, is_loop });

  console.log("test-2");
  const n_loop = search_for_guard_loops(arr, visited_pos, start);
  console.log({ n_loop });
}
