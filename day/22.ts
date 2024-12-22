import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 22");

type Cache = {
  [str_seq: string]: {
    [str_secret: string]: number;
  };
};

//////////////////////////

const read_input = (txt: string) => {
  const secrets = txt.split("\n")
    .map((e) => BigInt(parseInt(e.trim())));

  return secrets;
};

const step = (secret: bigint) => {
  const MOD = 16777216n;
  const s0 = secret;
  // 1
  let s = s0 << 6n;
  s = s ^ s0;
  s = s % MOD;
  const s1 = s;
  // 2
  s = s >> 5n;
  s = s ^ s1;
  s = s % MOD;
  const s2 = s;
  // 3
  s = s << 11n;
  s = s ^ s2;
  s = s % MOD;
  const s3 = s;

  return s3;
};

const steps = (secret: bigint, n: number) => {
  let s = secret;
  d3.range(n).forEach((_i) => {
    s = step(s);
  });
  return s;
};

const solve_1 = (secrets: bigint[]) => {
  console.log({ secrets });

  const N = 2000;

  let score = 0n;
  for (const s of secrets) {
    const out = steps(s, N);
    score += out;
  }
  return Number(score);
};

const calc_n_banana = (secret: bigint, seq: number[], N = 2000) => {
  assert(seq.length === 4);

  let last_price = Number(secret % 10n);
  const changes: number[] = [];

  let s = secret;
  for (const i of d3.range(N)) {
    s = step(s);

    const price = Number(s % 10n);
    const change = price - last_price;
    changes.push(change);
    if (i > 3) {
      changes.shift();
      assert(changes.length === 4);

      if (
        seq[0] === changes[0] &&
        seq[1] === changes[1] &&
        seq[2] === changes[2] &&
        seq[3] === changes[3]
      ) {
        return price;
      }
    }
    last_price = price;
  }
};

const solve_2 = (secrets: bigint[], N = 2000) => {
  const cache: Cache = {};

  const str_secret = (secret: bigint) => `${secret}`;
  const str_seq = (seq: number[]) => `${seq[0]}|${seq[1]}|${seq[2]}|${seq[3]}`;

  for (const secret of secrets) {
    const key_secret = str_secret(secret);
    let last_price = Number(secret % 10n);
    const changes: number[] = [];

    let s = secret;
    for (const i of d3.range(N)) {
      s = step(s);

      const price = Number(s % 10n);
      const change = price - last_price;
      changes.push(change);
      if (i > 3) {
        changes.shift();
        assert(changes.length === 4);
        const seq = changes;
        const key_seq = str_seq(seq);

        if (!cache[key_seq]) {
          cache[key_seq] = {};
        }
        if (!cache[key_seq][key_secret]) {
          cache[key_seq][key_secret] = price;
        }
      }
      last_price = price;
    }
  }

  const arr_seq = Object.keys(cache);
  console.log({ n_seq: arr_seq.length });

  const score_by_seq = Object.values(cache).map((e) =>
    Object.values(e).map((x) => x)
  ).map((e) => d3.sum(e));

  console.log({ score_by_seq });

  const score = d3.max(score_by_seq);

  return score;
};

////////////////// test

{
  let s = 123n;
  console.log({ s });

  d3.range(10).forEach((i) => {
    s = step(s);
    console.log(i, s);
  });
}

////////////////// 1

{
  console.log("=".repeat(50));
  console.log("test-1a");
  const txt = u.read_txt_file("22-test.txt");
  const secrets = read_input(txt);
  const score = solve_1(secrets);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("22.txt");
  const secrets = read_input(txt);
  const score = solve_1(secrets);
  console.log({ score });
}

////////////////// 2

{
  console.log("=".repeat(50));
  console.log("test-2a");

  const seq = [-1, -1, 0, 2];
  const secret = 123n;
  const N = 10;
  const n_banana = calc_n_banana(secret, seq, N);
  console.log({ secret, seq, N, n_banana });

  const secrets = [1, 2, 3, 2024].map((e) => BigInt(e));
  for (const secret of secrets) {
    const seq = [-2, 1, -1, 3];
    const N = 2000;
    const n_banana = calc_n_banana(secret, seq, N);
    console.log({ secret, seq, N, n_banana });
  }
}

{
  console.log("=".repeat(50));
  console.log("run-2");
  const txt = u.read_txt_file("22.txt");
  const secrets = read_input(txt);

  const score = solve_2(secrets);
  console.log({ score });
}
