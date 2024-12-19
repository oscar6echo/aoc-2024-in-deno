import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 19");

type Input = {
  patterns: string[];
  designs: string[];
};

type Cache_1 = {
  [design: string]: boolean;
};

type Cache_2 = {
  [design: string]: number;
};

const read_input = (txt: string) => {
  const blocks = txt.split("\n\n");
  assert(blocks.length === 2);

  const patterns = blocks[0].split(",").map((e) => e.trim());

  const designs = blocks[1].split("\n").map((e) => e.trim()).filter((e) =>
    e !== ""
  );

  return { patterns, designs } as Input;
};

const search_design_1 = (
  design: string,
  patterns: string[],
  cache: Cache_1,
) => {
  /**
   * recursion + cache
   * output: boolean
   */
  const search_rec = (design: string, cache: Cache_1): boolean => {
    if (design.length === 0) {
      return true;
    }

    if (cache[design] === undefined) {
      let possible = false;
      for (const p of patterns) {
        if (design.startsWith(p)) {
          const sub_design = design.slice(p.length);
          const _possible = search_rec(sub_design, cache);
          if (_possible) {
            // no need to search further
            return true;
          }
          possible = possible || _possible;
        }
      }
      cache[design] = possible;
    }

    return cache[design] || false;
  };

  const possible = search_rec(design, cache);
  return possible;
};

const search_design_2 = (
  design: string,
  patterns: string[],
  cache: Cache_2,
) => {
  /**
   * recursion + cache
   * output: nb ways
   */
  const search_rec = (design: string, cache: Cache_2): number => {
    if (design.length === 0) {
      return 1;
    }

    if (cache[design] === undefined) {
      let n_way = 0;
      for (const p of patterns) {
        if (design.startsWith(p)) {
          const sub_design = design.slice(p.length);
          const _n_way = search_rec(sub_design, cache);
          n_way += _n_way;
        }
      }
      cache[design] = n_way;
    }

    return cache[design];
  };

  const possible = search_rec(design, cache);
  return possible;
};

const solve_1 = (input: Input) => {
  const { designs, patterns } = input;

  const cache: Cache_1 = Object.fromEntries(patterns.map((e) => [e, true]));
  console.log({ n_cache: Object.keys(cache).length });

  const solutions = designs.map((e) => ({
    design: e,
    is_possible: search_design_1(e, patterns, cache),
  }));

  console.log({ n_cache: Object.keys(cache).length });
  //   console.log({ solutions });

  const score = solutions.filter((e) => e.is_possible).length;
  return score;
};

const solve_2 = (input: Input) => {
  const { designs, patterns } = input;

  const cache: Cache_2 = {};
  console.log({ n_cache: Object.keys(cache).length });

  const solutions = designs.map((e) => ({
    design: e,
    n_way: search_design_2(e, patterns, cache),
  }));

  console.log({ n_cache: Object.keys(cache).length });
  //   console.log({ solutions });

  const score = d3.sum(solutions.map((e) => e.n_way));
  return score;
};

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("19-test.txt");
  const input = read_input(txt);
  console.log({ input });

  const score = solve_1(input);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("19.txt");
  const input = read_input(txt);
  console.log({
    n_patterns: input.patterns.length,
    n_designs: input.designs.length,
  });

  const score = solve_1(input);
  console.log({ score });
}

////////////////// 2

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("19-test.txt");
  const input = read_input(txt);

  const score = solve_2(input);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("19.txt");
  const input = read_input(txt);
  console.log({
    n_patterns: input.patterns.length,
    n_designs: input.designs.length,
  });

  const score = solve_2(input);
  console.log({ score });
}
