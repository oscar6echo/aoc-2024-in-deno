import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 13");

type Robot = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Floor = {
  size_x: number;
  size_y: number;
  area: string[][];
};

const read_input = (txt: string): Robot[] => {
  const regex_robot = /p=(\d+),(\d+) v=(-?\d+),(-?\d+)/g;

  const arr = txt.split("\n").map((e, i) => {
    const arr = [...e.matchAll(regex_robot)];
    const id = i;
    const x = parseInt(arr[0][1]);
    const y = parseInt(arr[0][2]);
    const vx = parseInt(arr[0][3]);
    const vy = parseInt(arr[0][4]);

    const robot: Robot = { id, x, y, vx, vy };
    return robot;
  });

  return arr;
};

const mod = (i: number, m: number) => {
  return ((i % m) + m) % m;
};

const move_robot = (robot: Robot, floor: Floor, n_step: number) => {
  robot.x += robot.vx * n_step;
  robot.y += robot.vy * n_step;

  robot.x = mod(robot.x, floor.size_x);
  robot.y = mod(robot.y, floor.size_y);
};

const move_robots = (robots: Robot[], floor: Floor, n_step: number) => {
  robots.forEach((r) => move_robot(r, floor, n_step));
};

const update_foor = (robots: Robot[], floor: Floor) => {
  const area: string[][] = d3.range(floor.size_y).map((_i) =>
    d3.range(floor.size_x).map((_j) => ".")
  );
  robots.forEach((r) => {
    const s = area[r.y][r.x];
    let nb_robot = s === "." ? 0 : parseInt(s);
    nb_robot += 1;
    area[r.y][r.x] = String(nb_robot);
  });
  floor.area = area;
};

const show_floor = (floor: Floor, show_quadrants = false) => {
  console.log("");
  floor.area.forEach((r, i) => {
    if (show_quadrants && i === (floor.size_y - 1) / 2) {
      console.log(" ".repeat(floor.size_y));
    } else {
      let r_str = r.join("");
      if (show_quadrants) {
        const middle = (floor.size_x - 1) / 2;
        r_str = r_str.substring(0, middle) + " " +
          r_str.substring(middle + 1, r_str.length);
      }
      console.log(r_str);
    }
  });
  console.log("");
};

const calc_score = (floor: Floor) => {
  const middle_x = (floor.size_x - 1) / 2;
  const middle_y = (floor.size_y - 1) / 2;

  const calc = (a: string[][]) => {
    return d3.sum(
      a.flat().filter((e) => e !== ".").map((e) => parseInt(e)),
    );
  };

  const arr_1 = floor.area.slice(0, middle_y).map((e) => e.slice(0, middle_x));
  const score_1 = calc(arr_1);

  const arr_2 = floor.area.slice(0, middle_y).map((e) => e.slice(middle_x + 1));
  const score_2 = calc(arr_2);

  const arr_3 = floor.area.slice(middle_y + 1).map((e) => e.slice(0, middle_x));
  const score_3 = calc(arr_3);

  const arr_4 = floor.area.slice(middle_y + 1).map((e) =>
    e.slice(middle_x + 1)
  );
  const score_4 = calc(arr_4);

  const score = score_1 * score_2 * score_3 * score_4;
  return score;
};

const solve_1 = (
  robots: Robot[],
  floor: Floor,
  n_step: number,
  show = false,
) => {
  move_robots(robots, floor, n_step);
  update_foor(robots, floor);
  if (show) {
    show_floor(floor);
    show_floor(floor, true);
  }
  const score = calc_score(floor);
  return score;
};

const detect_vertical_line = (floor: Floor, n_length: number) => {
  /**
   * a christmas tree must have a trunk !
   */

  const nb = (s: string) => s === "." ? 0 : parseInt(s);

  const columns: number[][] = [];

  d3.range(floor.size_x).forEach((x) => {
    const col = d3.range(floor.size_y).map((y) => floor.area[x][y]).map((s) =>
      nb(s)
    );
    columns.push(col);
  });

  const longest_line = (col: number[]) => {
    let n = 0;
    let _n = 0;
    for (const e of col) {
      if (e > 0) {
        _n += 1;
      } else {
        n = Math.max(n, _n);
        _n = 0;
      }
    }
    return n;
  };

  for (const col of columns) {
    if (longest_line(col) > n_length) {
      return true;
    }
  }
  return false;
};

const solve_2 = (
  robots: Robot[],
  floor: Floor,
  max_n_step: number,
  n_vert_line: number,
) => {
  d3.range(max_n_step).forEach((i) => {
    move_robots(robots, floor, 1);
    update_foor(robots, floor);
    if (detect_vertical_line(floor, n_vert_line)) {
      console.log({ n_sec: i + 1 }); // beware: counter starts at 0
      show_floor(floor);
    }
  });
};

//////////////// 1

{
  console.log("test-1");
  const txt = u.read_txt_file("14-test.txt");

  const floor: Floor = { size_x: 11, size_y: 7, area: [] };
  const robots = read_input(txt);
  console.log({ robots, n_robots: robots.length, floor });
  const n_step = 100;
  const score = solve_1(robots, floor, n_step);
  console.log({ score });
}

{
  console.log("test-1");
  const txt = u.read_txt_file("14.txt");

  const floor: Floor = { size_x: 101, size_y: 103, area: [] };
  const robots = read_input(txt);
  console.log({ n_robots: robots.length, floor });
  const n_step = 100;
  const score = solve_1(robots, floor, n_step);
  console.log({ score });
}

//////////////// 2

{
  console.log("test-1");
  const txt = u.read_txt_file("14.txt");

  const floor: Floor = { size_x: 101, size_y: 103, area: [] };
  const robots = read_input(txt);
  console.log({ n_robots: robots.length, floor });
  const max_n_step = 100000; // large
  const n_vert_line = 30; // guessing
  const _res = solve_2(robots, floor, max_n_step, n_vert_line);
}
