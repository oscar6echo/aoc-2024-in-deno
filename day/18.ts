import { Heap } from "heap-js";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 18");

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

const read_input = (txt: string, n_byte: number) => {
  const arr_pos = txt.split("\n")
    .slice(0, n_byte)
    .map((e) => e.split(","))
    .map(
      (
        f,
      ) =>
        ({
          x: parseInt(f[0]),
          y: parseInt(f[1]),
        }) as Pos,
    );

  return arr_pos;
};

const build_floor = (arr_pos: Pos[], size: Size) => {
  const area = d3.range(size.y).map((y) =>
    d3.range(size.x).map((x) => {
      const p = arr_pos.find((e) => e.x === x && e.y === y);
      return p ? "#" : ".";
    })
  );
  const floor: Floor = {
    area,
    size,
    start: { x: 0, y: 0 },
    end: { x: size.x - 1, y: size.y - 1 },
  };
  return floor;
};

const show_floor = (floor: Floor, path: string[] = []) => {
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

const str_node = (a: Node) => `${a.x}-${a.y}`;

const build_graph = (floor: Floor) => {
  /** convert to generic graph */

  const left = (pos: Pos): Pos => ({ x: pos.x - 1, y: pos.y });
  const right = (pos: Pos): Pos => ({ x: pos.x + 1, y: pos.y });
  const up = (pos: Pos): Pos => ({ x: pos.x, y: pos.y - 1 });
  const down = (pos: Pos): Pos => ({ x: pos.x, y: pos.y + 1 });

  const get = (pos: Pos) => {
    if (
      pos.y >= 0 && pos.y < floor.size.y && pos.x >= 0 && pos.x < floor.size.x
    ) {
      return floor.area[pos.y][pos.x];
    }
    return null;
  };

  const g: Graph = {};

  const init = (node_id: string) => {
    if (!g[node_id]) {
      g[node_id] = { next: [], prev: [] };
    }
  };

  d3.range(floor.size.x).forEach((x) => {
    d3.range(floor.size.y).forEach((y) => {
      const pos = { x, y };
      if (get(pos) === ".") {
        const pos_up = up(pos);
        const pos_right = right(pos);
        const pos_down = down(pos);
        const pos_left = left(pos);

        const node_id = str_node(pos);
        const node_up_id = str_node(pos_up);
        const node_right_id = str_node(pos_right);
        const node_down_id = str_node(pos_down);
        const node_left_id = str_node(pos_left);

        [pos, pos_up, pos_right, pos_down, pos_left]
          .forEach((e) => {
            if (get(e) === ".") {
              init(str_node(e));
            }
          });

        // up direction
        if (get(pos_up) === ".") {
          g[node_id].next.push({ node_id: node_up_id, distance: 1 });
          g[node_up_id].prev.push({ node_id, distance: 1 });
        }

        // right direction
        if (get(pos_right) === ".") {
          g[node_id].next.push({ node_id: node_right_id, distance: 1 });
          g[node_right_id].prev.push({ node_id, distance: 1 });
        }
        // down direction
        if (get(pos_down) === ".") {
          g[node_id].next.push({ node_id: node_down_id, distance: 1 });
          g[node_down_id].prev.push({ node_id, distance: 1 });
        }
        // left direction
        if (get(pos_left) === ".") {
          g[node_id].next.push({ node_id: node_left_id, distance: 1 });
          g[node_left_id].prev.push({ node_id, distance: 1 });
        }
      }
    });
  });

  const start = str_node(floor.start);
  const end = str_node(floor.end);

  return { g, start, end };
};

const do_search = (g: Graph, start: string, end: string, timing = false) => {
  /** djikstra - cache previous nodes
   * cf. day 16
   */

  const t0 = new Date();

  // init
  const is_on_target = (node_id: string) => end === node_id;

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

  if (timing) {
    const t1 = new Date();
    const runtime = (t1.getTime() - t0.getTime()) / 1000;
    console.log(`runtime: ${runtime} s`);
  }

  return cache;
};

const calc_score_1 = (cache: NodeCache, end: string) => {
  const score = cache[end].total_distance;

  return score;
};

const solve_1 = (txt: string, size: Size, n_byte: number, show = false) => {
  const arr_pos = read_input(txt, n_byte);
  const floor = build_floor(arr_pos, size);
  if (show) show_floor(floor);
  const { g, start, end } = build_graph(floor);
  console.log({ start, end });

  const cache = do_search(g, start, end);
  const score = calc_score_1(cache, end);

  return score;
};

const solve_2 = (txt: string, size: Size, n_byte_start = 1, show = false) => {
  const t0 = new Date();

  let n_byte = n_byte_start;

  while (true) {
    const arr_pos = read_input(txt, n_byte);
    const new_byte = arr_pos[arr_pos.length - 1];
    const floor = build_floor(arr_pos, size);
    const { g, start, end } = build_graph(floor);
    const cache = do_search(g, start, end);
    const score = calc_score_1(cache, end);

    if (n_byte % 100 === 0) {
      console.log({ n_byte, new_byte, score });
    }

    if (!Number.isInteger(score)) {
      const t1 = new Date();
      const runtime = (t1.getTime() - t0.getTime()) / 1000;
      console.log(`runtime: ${runtime} s`);
      console.log("blocked at", { n_byte, new_byte, score });

      if (show) show_floor(floor);

      return new_byte;
    }

    n_byte += 1;
  }
};

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("18-test.txt");
  const size: Size = { x: 7, y: 7 };
  const n_byte = 12;

  const score = solve_1(txt, size, n_byte, true);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("18.txt");
  const size: Size = { x: 71, y: 71 };
  const n_byte = 1024;

  const score = solve_1(txt, size, n_byte, true);
  console.log({ score });
}

////////////////// 2

{
  console.log("=".repeat(50));
  console.log("test-2a");
  const txt = u.read_txt_file("18-test.txt");
  const size: Size = { x: 7, y: 7 };

  const blocking = solve_2(txt, size, 12, true);
  console.log({ blocking });
}

{
  console.log("=".repeat(50));
  console.log("run-2");
  const txt = u.read_txt_file("18.txt");
  const size: Size = { x: 71, y: 71 };
  const blocking = solve_2(txt, size, 1024, true);
  console.log({ blocking });
}
