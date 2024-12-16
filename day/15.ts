import { assert } from "@std/assert/assert";
import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 15");

type Pos = {
  x: number;
  y: number;
};

type Floor = {
  size_x: number;
  size_y: number;
  area: string[][];
};

type BoxStore = {
  [pos_left: string]: {
    neighbors: {
      push: string[];
      pushed_by: string[];
    };
    pos: Pos;
    movable: boolean | undefined;
    will_move?: boolean;
  };
};

const MOVES = ["<", ">", "^", "v"];

const read_input = (txt: string, widen = false) => {
  const r = txt.split("\n\n");
  assert(r.length === 2);

  const area = r[0].split("\n").map((e) => e.split(""));
  const size_y = area.length;
  const size_x = area[0].length;
  const floor: Floor = { area, size_x, size_y };

  const moves = r[1].split("").filter((e) => e != "\n");

  return { floor: widen ? widen_floor(floor) : floor, moves };
};

const widen_floor = (floor: Floor): Floor => {
  const area = floor.area.map((r) => {
    return r.map((e) => {
      return e === "#"
        ? "##"
        : e === "O"
        ? "[]"
        : e === "."
        ? ".."
        : e === "@"
        ? "@."
        : "";
    }).map((e) => e.split("")).flat();
  });
  return {
    area,
    size_x: 2 * floor.size_x,
    size_y: floor.size_y,
  };
};

const show_floor = (floor: Floor) => {
  console.log("");
  floor.area.forEach((r) => {
    const r_str = r.join("");
    console.log(r_str);
  });
  console.log("");
};

const gps_1 = (floor: Floor) => {
  const arr: Pos[] = [];
  d3.range(floor.size_y).forEach((y) => {
    d3.range(floor.size_x).forEach((x) => {
      if (floor.area[y][x] === "O") {
        arr.push({ x, y });
      }
    });
  });
  let score = 0;
  arr.forEach((e) => {
    const _score = 100 * e.y + e.x;
    score += _score;
  });
  return score;
};

const gps_2 = (floor: Floor) => {
  const arr: Pos[] = [];
  d3.range(floor.size_y).forEach((y) => {
    d3.range(floor.size_x).forEach((x) => {
      if (floor.area[y][x] === "[") {
        assert(floor.area[y][x + 1] === "]");
        arr.push({ x, y });
      }
    });
  });
  let score = 0;
  arr.forEach((e) => {
    const _score = 100 * e.y + e.x;
    score += _score;
  });
  return score;
};

const left = (pos: Pos): Pos => ({ x: pos.x - 1, y: pos.y });
const right = (pos: Pos): Pos => ({ x: pos.x + 1, y: pos.y });
const up = (pos: Pos): Pos => ({ x: pos.x, y: pos.y - 1 });
const down = (pos: Pos): Pos => ({ x: pos.x, y: pos.y + 1 });
const str_pos = (pos: Pos) => `${pos.x}-${pos.y}`;

const get_pos_robot = (floor: Floor) => {
  const _i = floor.area.flat().findIndex((e) => e === "@");
  const pos_robot = {
    x: _i % floor.size_x,
    y: Math.floor(_i / floor.size_x),
  };

  return pos_robot;
};

const move_robot_1 = (floor: Floor, m: string) => {
  assert(MOVES.includes(m));

  const get = (pos: Pos) => floor.area[pos.y][pos.x];
  const set = (pos: Pos, val: string) => floor.area[pos.y][pos.x] = val;

  const move = m === "<" ? left : m === ">" ? right : m === "^" ? up : down;

  const pos_robot = get_pos_robot(floor);

  const _pos_robot = move(pos_robot);
  if (get(_pos_robot) === "#") {
    // nothing moves
    return;
  }
  if (get(_pos_robot) === ".") {
    // only robot moves
    set(_pos_robot, "@");
    set(pos_robot, ".");
    return;
  }

  if (get(_pos_robot) === "O") {
    // list boxes in range
    let pos_box = _pos_robot;
    const boxes: Pos[] = [];
    while (get(pos_box) === "O") {
      boxes.push(pos_box);
      pos_box = move(pos_box);
    }
    if (get(pos_box) === "#") {
      // wall -> nothing moves
    } else if (get(pos_box) === ".") {
      // moves boxes and robot
      set(pos_box, "O");
      set(boxes[0], "@");
      set(pos_robot, ".");
    } else {
      throw Error("UNEXPECTED");
    }
    return;
  }

  throw Error("UNEXPECTED");
};

const move_robot_2 = (floor: Floor, m: string) => {
  assert(MOVES.includes(m));

  const get = (pos: Pos) => floor.area[pos.y][pos.x];
  const set = (pos: Pos, val: string) => floor.area[pos.y][pos.x] = val;

  const get_box = (pos: Pos) =>
    get(pos) === "[" ? pos : get(pos) === "]" ? left(pos) : null;

  const move = m === "<" ? left : m === ">" ? right : m === "^" ? up : down;

  const move_box = (box_pos: Pos) => {
    set(move(box_pos), "[");
    set(right(move(box_pos)), "]");
    if (m === "<") {
      set(right(box_pos), ".");
    } else if (m === ">") {
      set(box_pos, ".");
    } else {
      set(box_pos, ".");
      set(right(box_pos), ".");
    }
  };

  const find_impacted_boxes = (box_pos: Pos, store: BoxStore) => {
    const box_key = str_pos(box_pos);

    if (!store[box_key]) {
      const box_pos_left = box_pos;
      const box_pos_right = right(box_pos);

      const _pos_left = move(box_pos_left);
      const _pos_right = move(box_pos_right);
      const _box_pos_left = get_box(_pos_left);
      const _box_pos_right = get_box(_pos_right);
      const boxes = [_box_pos_left, _box_pos_right].filter((e) => e !== null);

      const movable = (get(_pos_left) === "#" || get(_pos_right) === "#")
        ? false
        : (get(_pos_left) === "." && get(_pos_right) === ".")
        ? true
        : undefined;

      assert(boxes.length > 0 || movable !== undefined);

      store[box_key] = {
        pos: box_pos,
        movable,
        will_move: undefined,
        neighbors: {
          push: boxes.map((e) => str_pos(e)),
          pushed_by: [],
        },
      };
      boxes.forEach((e) => find_impacted_boxes(e, store));

      if (movable === undefined) {
        store[box_key].movable = boxes.every((e) => store[str_pos(e)].movable);
      }
    }
  };

  const find_boxes_to_move = (boxes_in_range: BoxStore) => {
    // fill pushed_by
    Object.entries(boxes_in_range).forEach(([k, v]) => {
      //   console.log({ k, v });
      const arr = v.neighbors.push;
      arr.forEach((e) => {
        boxes_in_range[e].neighbors.pushed_by.push(k);
      });
    });

    const sort_pos_move_dir = (a: Pos, b: Pos) =>
      m === "^" ? d3.descending(a.y, b.y) : d3.ascending(a.y, b.y);
    const sort_pos_rev_move_dir = (a: Pos, b: Pos) =>
      m === "^" ? d3.ascending(a.y, b.y) : d3.descending(a.y, b.y);

    // sort by y
    const sorted_boxes = Object.values(boxes_in_range)
      .map((e) => e.pos).sort(sort_pos_move_dir);

    // determine which box moves
    sorted_boxes.forEach((e, i) => {
      const key = str_pos(e);
      const x = boxes_in_range[key];
      if (i === 0) {
        x.will_move = x.movable;
      } else {
        const prev_keys = x.neighbors.pushed_by;
        const will_move = x.movable &&
          prev_keys.every((f) => boxes_in_range[f].will_move);
        x.will_move = will_move;
      }
    });

    // extract
    const boxes_to_move = Object.values(boxes_in_range).filter((e) =>
      e.will_move
    ).map((e) => e.pos).sort(sort_pos_rev_move_dir);

    return boxes_to_move;
  };

  const pos_robot = get_pos_robot(floor);

  const _pos_robot = move(pos_robot);
  if (get(_pos_robot) === "#") {
    // nothing moves
    return;
  }
  if (get(_pos_robot) === ".") {
    // only robot moves
    set(_pos_robot, "@");
    set(pos_robot, ".");
    return;
  }

  const _box = get_box(_pos_robot);

  if (_box) {
    if (["^", "v"].includes(m)) {
      // list boxes in range
      const boxes_in_range: BoxStore = {};
      find_impacted_boxes(_box, boxes_in_range);
      const boxes_to_move = find_boxes_to_move(boxes_in_range);

      boxes_to_move.forEach((e) => {
        move_box(e);
      });
      if (boxes_to_move.length > 0) {
        // move robot
        set(_pos_robot, "@");
        set(pos_robot, ".");
      }
      // done
    } else if (["<", ">"].includes(m)) {
      // list boxes in range
      const boxes_in_range = [];
      let pos_box = _box;

      while (get(pos_box) === "[") {
        boxes_in_range.push(pos_box);
        pos_box = move(pos_box);
        if (get(pos_box) === "]") {
          pos_box = move(pos_box);
        }
      }

      if (get(pos_box) === "#") {
        // wall -> nothing moves
      } else if (get(pos_box) === ".") {
        // moves boxes and robot
        const boxes_to_move = boxes_in_range.reverse();

        boxes_to_move.forEach((e) => {
          move_box(e);
        });
        // move robot
        set(_pos_robot, "@");
        set(pos_robot, ".");
        // done
      } else {
        throw Error("UNEXPECTED");
      }
    } else {
      throw Error("UNEXPECTED");
    }

    return;
  }

  throw Error("UNEXPECTED");
};

const simulate_1 = (floor: Floor, moves: string[], show = true) => {
  console.log({ n_move: moves.length });
  moves.forEach((m, i) => {
    move_robot_1(floor, m);
    if (show) {
      console.log({ i, m });
      show_floor(floor);
    }
  });
  const score = gps_1(floor);
  return score;
};

const simulate_2 = (floor: Floor, moves: string[], show = true) => {
  console.log({ n_move: moves.length });
  moves.forEach((m, i) => {
    move_robot_2(floor, m);
    if (show) {
      console.log({ i, m });
      show_floor(floor);
    }
  });
  const score = gps_2(floor);
  return score;
};

//////////////// 1

{
  console.log("=".repeat(50));
  console.log("\ntest-1a");
  const txt = u.read_txt_file("15-test-a.txt");

  const { floor, moves } = read_input(txt);
  //   console.log({ floor, moves });
  show_floor(floor);

  const score = simulate_1(floor, moves, false);
  show_floor(floor);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("test-1b");
  const txt = u.read_txt_file("15-test-b.txt");

  const { floor, moves } = read_input(txt);
  show_floor(floor);

  const score = simulate_1(floor, moves, false);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-1");
  const txt = u.read_txt_file("15.txt");

  const { floor, moves } = read_input(txt);
  show_floor(floor);

  const score = simulate_1(floor, moves, false);
  console.log({ score });
}

//////////////// 2

{
  console.log("=".repeat(50));
  console.log("test-2c");
  const txt = u.read_txt_file("15-test-c.txt");

  const { floor, moves } = read_input(txt, true);
  show_floor(floor);

  const score = simulate_2(floor, moves, false);
  show_floor(floor);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("test-2a");
  const txt = u.read_txt_file("15-test-a.txt");

  const { floor, moves } = read_input(txt, true);
  show_floor(floor);

  const score = simulate_2(floor, moves.slice(0));
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("test-2b");
  const txt = u.read_txt_file("15-test-b.txt");

  const { floor, moves } = read_input(txt, true);
  show_floor(floor);

  const score = simulate_2(floor, moves, false);
  show_floor(floor);
  console.log({ score });
}

{
  console.log("=".repeat(50));
  console.log("run-2");
  const txt = u.read_txt_file("15.txt");

  const { floor, moves } = read_input(txt, true);
  show_floor(floor);

  const score = simulate_2(floor, moves, false);
  console.log({ score });
}
