import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 11");

type CacheBlinked = {
  [key: number]: number[];
};

type CacheScore = {
  [key: string]: number;
};

const read_input = (txt: string) => {
  /** */

  const stones = txt.split(" ").map((x) => (parseInt(x)));
  return stones;
};

const blink = (stone: number, cache: CacheBlinked): number[] => {
  if (!cache[stone]) {
    if (stone === 0) {
      cache[0] = [1];
    } else if (stone.toString().length % 2 === 0) {
      const s = stone.toString();
      const a = parseInt(s.slice(0, s.length / 2));
      const b = parseInt(s.slice(s.length / 2, s.length));
      cache[stone] = [a, b];
    } else {
      cache[stone] = [stone * 2024];
    }
  }

  return cache[stone];
};

const calc_score_1 = (stones: number[], n_blink: number) => {
  let _stones = [...stones];
  const cache: CacheBlinked = {};

  d3.range(n_blink).forEach((i) => {
    const __stones: number[] = [];
    _stones.forEach((e) => {
      const blinked = blink(e, cache);
      __stones.push(...blinked);
    });
    _stones = [...__stones];

    console.log({
      i,
      score: _stones.length,
      n_unique_stone: Object.keys(cache).length,
    });
  });

  return _stones.length;
};

const calc_score_rec = (
  stone: number,
  n_blink: number,
  cache_stone: CacheBlinked,
  cache_stone_blink: CacheScore,
): number => {
  if (n_blink === 0) return 1;

  const key = `${stone}-${n_blink}`;
  if (!cache_stone_blink[key]) {
    const scores = blink(stone, cache_stone).map((e) =>
      calc_score_rec(e, n_blink - 1, cache_stone, cache_stone_blink)
    );
    const score = d3.sum(scores);

    cache_stone_blink[key] = score;
  }

  return cache_stone_blink[key];
};

const calc_score_2 = (stones: number[], n_blink: number) => {
  const cache_stone: CacheBlinked = {};
  const cache_n_blink: CacheScore = {};
  const score = d3.sum(
    stones.map((e) => calc_score_rec(e, n_blink, cache_stone, cache_n_blink)),
  );
  return score;
};

//////////////// 1

{
  console.log("test-1");
  const txt = u.read_txt_file("11-test.txt");

  const stones = read_input(txt);
  console.log({ stones });

  const score = calc_score_1(stones, 6);
  console.log({ score });
}

{
  console.log("run-1");
  const txt = u.read_txt_file("11.txt");

  const stones = read_input(txt);
  console.log({ stones });

  const score = calc_score_1(stones, 25);
  console.log({ score });
}

//////////////// 2

{
  console.log("run-2");
  const txt = u.read_txt_file("11.txt");

  const stones = read_input(txt);
  console.log({ stones });

  const score = calc_score_2(stones, 75);
  console.log({ score });
}
