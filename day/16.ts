import { assert } from "@std/assert/assert";
import { Heap } from "heap-js";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 16");

type Pos = {
  x: number;
  y: number;
};

type Floor = {
  area: string[][];
  size: Pos;
  start: Pos;
  end: Pos;
};

type Node = {
  pos: Pos;
  face: string;
};

type Edge = {
  node_id: string;
  distance: number;
};

type Graph = {
  [node_id: string]: {
    next: Edge[];
    prev: Edge[];
  };
};

type NodeCache = {
  [node_id: string]: {
    prev_nodes: string[];
    total_distance: number;
    visited: boolean;
    node_id: string; // repeat - convenience
  };
};

type HeapNode = {
  node_id: string;
  distance: number;
  prev_node: string;
};

const read_input = (txt: string) => {
  const area = txt.split("\n").map((e) => e.split(""));
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

const str_node = (x: Node) => `${x.pos.x}-${x.pos.y}-${x.face}`;

const build_graph = (floor: Floor) => {
  /** convert to generic graph */

  const west = (pos: Pos): Pos => ({ x: pos.x - 1, y: pos.y });
  const east = (pos: Pos): Pos => ({ x: pos.x + 1, y: pos.y });
  const north = (pos: Pos): Pos => ({ x: pos.x, y: pos.y - 1 });
  const south = (pos: Pos): Pos => ({ x: pos.x, y: pos.y + 1 });

  const get = (pos: Pos) => {
    if (
      pos.y >= 0 && pos.y < floor.size.y && pos.x >= 0 && pos.x < floor.size.x
    ) {
      return floor.area[pos.y][pos.x];
    }
    return null;
  };

  const g: Graph = {};

  d3.range(floor.size.x).forEach((x) => {
    d3.range(floor.size.y).forEach((y) => {
      const pos = { x, y };
      if (get(pos) !== "#") {
        const node_north = str_node({ pos, face: "N" });
        const node_east = str_node({ pos, face: "E" });
        const node_south = str_node({ pos, face: "S" });
        const node_west = str_node({ pos, face: "W" });

        // same pos change direction
        g[node_north] = { next: [], prev: [] };
        g[node_north].next.push({ node_id: node_east, distance: 1000 });
        g[node_north].prev.push({ node_id: node_east, distance: 1000 });
        g[node_north].next.push({ node_id: node_west, distance: 1000 });
        g[node_north].prev.push({ node_id: node_west, distance: 1000 });

        g[node_east] = { next: [], prev: [] };
        g[node_east].next.push({ node_id: node_north, distance: 1000 });
        g[node_east].prev.push({ node_id: node_north, distance: 1000 });
        g[node_east].next.push({ node_id: node_south, distance: 1000 });
        g[node_east].prev.push({ node_id: node_south, distance: 1000 });

        g[node_south] = { next: [], prev: [] };
        g[node_south].next.push({ node_id: node_east, distance: 1000 });
        g[node_south].prev.push({ node_id: node_east, distance: 1000 });
        g[node_south].next.push({ node_id: node_west, distance: 1000 });
        g[node_south].prev.push({ node_id: node_west, distance: 1000 });

        g[node_west] = { next: [], prev: [] };
        g[node_west].next.push({ node_id: node_south, distance: 1000 });
        g[node_west].prev.push({ node_id: node_south, distance: 1000 });
        g[node_west].next.push({ node_id: node_north, distance: 1000 });
        g[node_west].prev.push({ node_id: node_north, distance: 1000 });

        const pos_north = north(pos);
        const pos_east = east(pos);
        const pos_south = south(pos);
        const pos_west = west(pos);

        // north direction
        if (get(pos_north) !== "#") {
          const node_nn = str_node({ pos: pos_north, face: "N" });
          g[node_north].next.push({ node_id: node_nn, distance: 1 });
        }
        if (get(pos_south) !== "#") {
          const node_sn = str_node({ pos: pos_south, face: "N" });
          g[node_north].prev.push({ node_id: node_sn, distance: 1 });
        }

        // east direction
        if (get(pos_east) !== "#") {
          const node_ee = str_node({ pos: pos_east, face: "E" });
          g[node_east].next.push({ node_id: node_ee, distance: 1 });
        }
        if (get(pos_west) !== "#") {
          const node_we = str_node({ pos: pos_west, face: "E" });
          g[node_east].prev.push({ node_id: node_we, distance: 1 });
        }

        // south direction
        if (get(pos_south) !== "#") {
          const node_ss = str_node({ pos: pos_south, face: "S" });
          g[node_south].next.push({ node_id: node_ss, distance: 1 });
        }
        if (get(pos_north)) {
          const node_ns = str_node({ pos: pos_north, face: "S" });
          g[node_south].prev.push({ node_id: node_ns, distance: 1 });
        }

        // west direction
        if (get(pos_west) !== "#") {
          const node_ww = str_node({ pos: pos_west, face: "W" });
          g[node_west].next.push({ node_id: node_ww, distance: 1 });
        }
        if (get(pos_east)) {
          const node_ew = str_node({ pos: pos_east, face: "W" });
          g[node_west].prev.push({ node_id: node_ew, distance: 1 });
        }
      }
    });
  });

  console.log("save tmp/test-graph.json");
  Deno.writeTextFile("tmp/test-graph.json", JSON.stringify(g, null, 2));

  const start = str_node({ pos: floor.start, face: "E" });
  const ends = ["N", "E", "S", "W"].map((e) =>
    str_node({ pos: floor.end, face: e })
  );

  return { g, start, ends };
};

const do_search = (g: Graph, start: string, ends: string[]) => {
  /** djikstra - cache previous nodes */

  const t0 = new Date();

  // init
  const prefix_target = ends[0].slice(0, ends[0].length - 2);
  const is_on_target = (node_id: string) => node_id === prefix_target;

  // min-distance heap
  const func_prio = (a: HeapNode, b: HeapNode) => a.distance - b.distance;
  const heap = new Heap(func_prio);

  const cache: NodeCache = {};
  Object.keys(g).forEach((e) => {
    cache[e] = {
      prev_nodes: [],
      total_distance: +Infinity,
      visited: false,
      node_id: e,
    };
    if (e === start) {
      cache[e].total_distance = 0;
      cache[e].prev_nodes = [];
    }
  });

  heap.push({ node_id: start, distance: 0, prev_node: "START" });
  let max_target_distance = Infinity;

  while (true) {
    const obj = heap.pop();

    // empty
    if (!obj) {
      // done
      break;
    }

    // extract
    // guaranteed to be min distance
    const { node_id, distance, prev_node } = obj;

    // dead end
    if (distance > max_target_distance) {
      continue;
    }

    // record path
    if (cache[node_id].visited) {
      if (
        prev_node !== "START" &&
        cache[node_id].total_distance === distance
      ) {
        cache[node_id].prev_nodes.push(prev_node);
        // cache[node_id].prev_nodes.add(prev_node);
      }
      // dead end
      continue;
    }

    cache[node_id].visited = true;
    cache[node_id].total_distance = distance;
    if (prev_node !== "START") {
      cache[node_id].prev_nodes = [prev_node];
    }

    if (is_on_target(node_id)) {
      max_target_distance = distance;
      // done
      break;
    }

    // visit unvisited neighbors
    const neighbors_next = g[node_id].next.filter((e) =>
      !cache[e.node_id].visited
    );

    for (const neighbor of neighbors_next) {
      // send to heap
      // designed to return min distance on pop
      heap.push({
        node_id: neighbor.node_id,
        distance: cache[node_id].total_distance + neighbor.distance,
        prev_node: node_id,
      });
    }
  }

  const t1 = new Date();
  const runtime = (t1.getTime() - t0.getTime()) / 1000;
  console.log(`runtime: ${runtime} s`);

  console.log("save tmp/test-nodecache.json");
  Deno.writeTextFile("tmp/test-nodecache.json", JSON.stringify(cache, null, 2));

  return cache;
};

const calc_score_1 = (visited: NodeCache, ends: string[]) => {
  const _ends = Object.values(visited).filter((e) => ends.includes(e.node_id));
  const score = d3.min(_ends.map((e) => e.total_distance));
  assert(score !== undefined);
  return score;
};

const calc_score_2 = (visited: NodeCache, ends: string[]) => {
  const _ends = Object.values(visited).filter((e) => ends.includes(e.node_id));
  const score = d3.min(_ends.map((e) => e.total_distance));
  assert(score !== undefined);
  const __ends = _ends.filter((e) => e.total_distance === score);

  const nodes_prev = new Set<string>();
  __ends.forEach((e) => nodes_prev.add(e.node_id));

  const nodes_visited = new Set<string>();
  while (true) {
    const nodes_todo = [...nodes_prev].filter((e) => !nodes_visited.has(e));
    if (nodes_todo.length === 0) {
      break;
    }
    nodes_todo.forEach((e) => {
      visited[e].prev_nodes.forEach((f) => {
        nodes_prev.add(f);
      });
      nodes_visited.add(e);
    });
  }

  const pos_prev = new Set([...nodes_prev].map((e) => {
    const [x, y, _f] = e.split("-");
    return `${x}-${y}`;
  }));

  const path = [...pos_prev];
  const n_path_node = path.length;

  return { n_path_node, path };
};

const show_floor = (floor: Floor, path: string[]) => {
  const set = (arr: string[][], pos: Pos) => arr[pos.y][pos.x] = "O";

  const { area } = u.clone(floor);
  path.forEach((e) => {
    const [x, y] = e.split("-").map((e) => parseInt(e));
    set(area, { x, y });
  });

  console.log("");
  area.forEach((r) => {
    const r_str = r.join("");
    console.log(r_str);
  });
  console.log("");
};

const solve_1 = (floor: Floor) => {
  const { g, start, ends } = build_graph(floor);
  console.log({ start, ends });

  const visited = do_search(g, start, ends);
  const score = calc_score_1(visited, ends);
  return score;
};

const solve_2 = (floor: Floor, show = true) => {
  const { g, start, ends } = build_graph(floor);
  console.log({ start, ends });

  const visited = do_search(g, start, ends);

  const { n_path_node: score, path } = calc_score_2(visited, ends);

  if (show) {
    show_floor(floor, path);
  }

  return score;
};

//////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("16-test-a.txt");

  const floor = read_input(txt);
  //   console.log({ floor });
  const score = solve_1(floor);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("test-1b");
  const txt = u.read_txt_file("16-test-b.txt");

  const floor = read_input(txt);
  const score = solve_1(floor);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("16.txt");

  const floor = read_input(txt);
  const score = solve_1(floor);
  console.log({ score });
}

//////////////// 2

{
  console.log("=".repeat(50));
  console.log("test-2a");
  const txt = u.read_txt_file("16-test-a.txt");

  const floor = read_input(txt);
  const score = solve_2(floor);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("test-2b");
  const txt = u.read_txt_file("16-test-b.txt");

  const floor = read_input(txt);
  const score = solve_2(floor);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-2");
  const txt = u.read_txt_file("16.txt");

  const floor = read_input(txt);
  const score = solve_2(floor, false);
  console.log({ score });
}
