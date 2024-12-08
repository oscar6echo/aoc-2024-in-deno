// import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 8");

type Antenna = {
  v: number; // vertical
  h: number; // horizontal
  freq: string;
};

type Node = {
  v: number; // vertical
  h: number; // horizontal
};

const build_input = (txt: string) => {
  /** */

  const chars = txt.split("").filter((e) => e !== "\n");

  const freqs = [...new Set(chars)].filter((e) => e !== ".")
    .sort();

  const arr = txt.split("\n").filter((e) => e !== "").map((e) => e.split(""));
  const n = arr.length;
  const m = arr[0].length;

  const antennas: Antenna[] = [];

  chars.forEach((e, i) => {
    if (freqs.includes(e)) {
      const v = Math.floor(i / n);
      const h = i % n;
      const antenna: Antenna = { freq: e, v, h };
      antennas.push(antenna);
    }
  });

  return { freqs, antennas, n, m };
};

const find_pairs = (points: Node[]) => {
  const pairs: Node[][] = [];

  for (const i of d3.range(points.length)) {
    for (const j of d3.range(i + 1, points.length)) {
      pairs.push([points[i], points[j]]);
    }
  }
  return pairs;
};

const is_inside = (p: Node, n: number, m: number) => {
  return p.v >= 0 && p.v < n && p.h >= 0 && p.h < m;
};
const str = (p: Node) => {
  return `${p.v}-${p.h}`;
};

const find_antinode = (
  nodes: Node[],
  n: number,
  m: number,
  v2: boolean,
) => {
  const antinodes = new Set<string>();

  if (v2) {
    for (const e of nodes) {
      antinodes.add(str(e));
    }
  }

  const pairs = find_pairs(nodes);

  for (const [p1, p2] of pairs) {
    const dv = p2.v - p1.v;
    const dh = p2.h - p1.h;

    if (v2) {
      let is_fwd_out = false;
      let k_fwd = 1;
      while (!is_fwd_out) {
        const antinode_1 = { v: p2.v + dv * k_fwd, h: p2.h + dh * k_fwd };
        const str_1 = str(antinode_1);
        if (is_inside(antinode_1, n, m)) {
          antinodes.add(str_1);
          k_fwd += 1;
        } else {
          is_fwd_out = true;
        }
      }

      let is_bwd_out = false;
      let k_bwd = 1;
      while (!is_bwd_out) {
        const antinode_1 = { v: p1.v - dv * k_bwd, h: p1.h - dh * k_bwd };
        const str_1 = str(antinode_1);
        if (is_inside(antinode_1, n, m)) {
          antinodes.add(str_1);
          k_bwd += 1;
        } else {
          is_bwd_out = true;
        }
      }
    } else {
      const antinode_1 = { v: p2.v + dv, h: p2.h + dh };
      const str_1 = str(antinode_1);
      if (is_inside(antinode_1, n, m)) {
        antinodes.add(str_1);
      }
      const antinode_2 = { v: p1.v - dv, h: p1.h - dh };
      const str_2 = str(antinode_2);
      if (is_inside(antinode_2, n, m)) {
        antinodes.add(str_2);
      }
    }
  }

  return antinodes;
};

const find_antinodes = (
  freqs: string[],
  nodes: Antenna[],
  n: number,
  m: number,
  v2: boolean,
) => {
  const antinodes = new Set<string>();
  for (const freq of freqs) {
    const _nodes = nodes.filter((e) => e.freq === freq).map((e) => ({
      h: e.h,
      v: e.v,
    }));
    const _antinodes = find_antinode(_nodes, n, m, v2);
    for (const e of _antinodes) {
      antinodes.add(e);
    }
  }

  return antinodes.size;
};

//////////////// 1

{
  console.log("test-1");
  const txt = u.read_txt_file("8-test.txt");

  const { freqs, antennas, n, m } = build_input(txt);
  console.log({ freqs, antennas, n, m });

  const n_antinode = find_antinodes(freqs, antennas, n, m, false);

  console.log({ n_antinode });
}

{
  console.log("run-1");
  const txt = u.read_txt_file("8.txt");

  const { freqs, antennas, n, m } = build_input(txt);
  console.log({ freqs, n, m });

  const n_antinode = find_antinodes(freqs, antennas, n, m, false);

  console.log({ n_antinode });
}

//////////////// 1

{
  console.log("test-2");
  const txt = u.read_txt_file("8-test.txt");

  const { freqs, antennas, n, m } = build_input(txt);
  console.log({ freqs, antennas, n, m });

  const n_antinode = find_antinodes(freqs, antennas, n, m, true);

  console.log({ n_antinode });
}

{
  console.log("run-2");
  const txt = u.read_txt_file("8.txt");

  const { freqs, antennas, n, m } = build_input(txt);
  console.log({ freqs, antennas, n, m });

  const n_antinode = find_antinodes(freqs, antennas, n, m, true);

  console.log({ n_antinode });
}
