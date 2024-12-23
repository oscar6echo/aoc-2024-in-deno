import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 23");

type Pair = string[];
type Neighbors = { [node: string]: Set<string> };

//////////////////////////

const read_input = (txt: string) => {
  const pairs = txt.split("\n")
    .map((e) => e.split("-"));

  return pairs;
};

const solve_1 = (pairs: Pair[]) => {
  // console.log({ pairs });
  console.log({ n_pair: pairs.length });

  const neighbors: Neighbors = {};

  for (const p of pairs) {
    for (const i of [0, 1]) {
      if (!neighbors[p[i]]) {
        neighbors[p[i]] = new Set();
      }
      const j = i === 1 ? 0 : 1;
      neighbors[p[i]].add(p[j]);
    }
  }

  // console.log({ neighbors });
  console.log({ n_node: Object.keys(neighbors).length });

  const _groups = new Set<string>();

  Object.entries(neighbors).forEach(([k, v]) => {
    const nodes = [...v];
    d3.range(nodes.length).forEach((i) => {
      d3.range(i + 1, nodes.length).forEach((j) => {
        const a = nodes[i];
        const b = nodes[j];

        if (neighbors[a].has(b) && neighbors[b].has(a)) {
          const g = [k, a, b].toSorted();
          const group_id = `${g[0]}-${g[1]}-${g[2]}`;
          _groups.add(group_id);
        }
      });
    });
  });

  // console.log({ _groups });
  console.log({ n_group_all: _groups.size });

  const groups = [..._groups].filter((e) => {
    const [a, b, c] = e.split("-");
    return a.startsWith("t") || b.startsWith("t") || c.startsWith("t");
  }).toSorted();

  const n_group = groups.length;

  // console.log({ groups });
  console.log({ n_group_filterd: n_group });

  return n_group;
};

const get_largest = (arr: number[][]) => {
  /** square matrix of 0,1
   * symmetric
   * 1 on diagonal
   * return vector of rows such that matrix is 1 only
   */

  const size = arr.length;
  // console.log({ size });
  const looper = u.build_looper(size, 2);
  const arr_select = looper();

  let n = size;
  while (true) {
    const n_sqr = n * n;
    for (const select of arr_select) {
      if (d3.sum(select) === n) {
        // console.log({ select });
        const sub_arr = arr.filter((_e, i) => select[i] === 1).map((e) =>
          e.filter((_f, j) => select[j] === 1)
        );
        // console.log({ sub_arr });
        const sum = d3.sum(sub_arr.map((e) => d3.sum(e)));
        if (sum === n_sqr) {
          return select.map((e, i) => e === 1 ? i : null).filter((e) =>
            e !== null
          );
        }
      }
    }
    if (n === 1) {
      throw Error("UNEXPECTED");
    }
    n -= 1;
  }
};

const solve_2 = (pairs: Pair[]) => {
  // console.log({ pairs });
  console.log({ n_pair: pairs.length });

  const neighbors: Neighbors = {};

  for (const p of pairs) {
    for (const i of [0, 1]) {
      if (!neighbors[p[i]]) {
        neighbors[p[i]] = new Set();
      }
      const j = i === 1 ? 0 : 1;
      neighbors[p[i]].add(p[j]);
    }
  }

  // console.log({ neighbors });
  console.log({ n_node: Object.keys(neighbors).length });

  const groups = new Set<string>();

  Object.entries(neighbors).forEach(([k, v]) => {
    const nodes = [...v];
    const len = nodes.length;

    const arr = Array.from(
      { length: len },
      () => Array.from({ length: len }, () => 0),
    );

    nodes.forEach((x, i) => {
      nodes.forEach((y, j) => {
        if (x !== y) {
          arr[i][j] = neighbors[x].has(y) ? 1 : 0;
        } else {
          arr[i][j] = 1;
        }
      });
    });

    // console.log(arr);

    const _largest = get_largest(arr);

    const largest = [k, ..._largest.map((i) => nodes[i])].toSorted().join("-");
    // console.log({ _largest, largest });

    groups.add(largest);
  });

  // console.log({ groups });

  const _groups = [...groups];
  const max_size = d3.max(_groups.map((e) => e.split("-").length));
  assert(max_size !== undefined);
  const _largest_group = _groups.find((e) => e.split("-").length === max_size);
  assert(_largest_group !== undefined);
  const largest_group = _largest_group.replaceAll("-", ",");

  return { largest_group };
};

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("23-test.txt");
  const pairs = read_input(txt);
  const score = solve_1(pairs);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("23.txt");
  const pairs = read_input(txt);
  const score = solve_1(pairs);
  console.log({ score });
}

////////////////// 2

{
  console.log("=".repeat(50));
  console.log("test-2a");
  const txt = u.read_txt_file("23-test.txt");
  const pairs = read_input(txt);
  const score = solve_2(pairs);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-2");
  const txt = u.read_txt_file("23.txt");
  const pairs = read_input(txt);
  const score = solve_2(pairs);
  console.log({ score });
}
