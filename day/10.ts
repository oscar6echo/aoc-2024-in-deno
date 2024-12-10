import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 10");

type Topo = {
  arr: number[][];
  n: number;
  m: number;
};

type Pos = {
  v: number;
  h: number;
  level: number;
};

type Solution = {
  [key: string]: number;
};

const read_topo = (txt: string): Topo => {
  /** */

  const arr = txt.split("\n").map((e) => e.split("").map((x) => parseInt(x)));
  const n = arr.length;
  const m = arr[0].length;

  return { arr, n, m };
};

const find_starts_ends = (topo: Topo) => {
  const starts: Pos[] = [];

  for (const v of d3.range(topo.n)) {
    for (const h of d3.range(topo.m)) {
      if (topo.arr[v][h] === 0) {
        starts.push({ v, h, level: 0 });
      }
    }
  }

  return { starts };
};

const is_inside = (pos: Pos, topo: Topo) => {
  return pos.v >= 0 && pos.v < topo.n && pos.h >= 0 && pos.h < topo.m;
};

const next_points = (pos: Pos, topo: Topo) => {
  const points: Pos[] = [];
  const { v, h, level } = pos;
  for (const [dv, dh] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
    const _v = v + dv;
    const _h = h + dh;
    const _point = { v: _v, h: _h, level: level + 1 };
    if (is_inside(_point, topo) && _point.level === topo.arr[_v][_h]) {
      points.push({ v: _v, h: _h, level: topo.arr[_v][_h] });
    }
  }
  return points;
};

const expand_path = (path: Pos[], topo: Topo) => {
  const paths: Pos[][] = [];

  const pos_last = path[path.length - 1];
  const pos_next = next_points(pos_last, topo);

  for (const e of pos_next) {
    const _path = [...path];
    _path.push(e);
    paths.push(_path);
  }

  return paths;
};

const is_complete = (path: Pos[], target: number) => {
  return path[path.length - 1].level === target;
};

const find_n_end_pos = (start: Pos, topo: Topo) => {
  const paths_ongoing: Pos[][] = [[start]];
  const paths_complete: Pos[][] = [];

  while (true) {
    const path = paths_ongoing.pop();
    if (!path) break;

    const _paths = expand_path(path, topo);
    for (const e of _paths) {
      if (is_complete(e, 9)) {
        paths_complete.push(e);
      } else {
        paths_ongoing.push(e);
      }
    }
  }

  const n_end_pos =
    new Set(paths_complete.map((e) => str(e[e.length - 1]))).size;

  const n_paths = paths_complete.length;

  return { n_end_pos, n_paths };
};

const str = (pos: Pos) => {
  return `${pos.v}-${pos.h}`;
};

const build_score = (starts: Pos[], topo: Topo) => {
  const sol_1: Solution = {};
  const sol_2: Solution = {};

  for (const start of starts) {
    const { n_end_pos, n_paths } = find_n_end_pos(
      start,
      topo,
    );
    sol_1[str(start)] = n_end_pos;
    sol_2[str(start)] = n_paths;
  }

  const arr_n_end_pos = Object.values(sol_1);
  const score_1 = d3.sum(arr_n_end_pos);

  const arr_n_path = Object.values(sol_2);
  const score_2 = d3.sum(arr_n_path);

  return { score_1, score_2 };
};

//////////////// 1

{
  console.log("test-1");
  const txt = u.read_txt_file("10-test.txt");

  const topo = read_topo(txt);
  //   console.log({ topo });
  const { starts } = find_starts_ends(topo);
  const { score_1 } = build_score(starts, topo);

  console.log({ score_1 });
}

{
  console.log("run-1");
  const txt = u.read_txt_file("10.txt");

  const topo = read_topo(txt);
  const { starts } = find_starts_ends(topo);
  const { score_1 } = build_score(starts, topo);

  console.log({ score_1 });
}

//////////////// 1

{
  console.log("test-2");
  const txt = u.read_txt_file("10-test.txt");

  const topo = read_topo(txt);
  //   console.log({ topo });
  const { starts } = find_starts_ends(topo);
  const { score_2 } = build_score(starts, topo);

  console.log({ score_2 });
}

{
  console.log("run-2");
  const txt = u.read_txt_file("10.txt");

  const topo = read_topo(txt);
  //   console.log({ topo });
  const { starts } = find_starts_ends(topo);
  const { score_2 } = build_score(starts, topo);

  console.log({ score_2 });
}
