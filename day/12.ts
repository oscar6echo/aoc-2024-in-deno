import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 12");

type Plot = {
  type: string;
  visited: boolean;
};
type Farm = {
  area: Plot[][];
  n: number;
  m: number;
};
type Pos = {
  v: number; // vertical
  h: number; // horizontal
};
type Region = {
  type: string;
  loc: Pos[];
};

type FenceSegment = {
  loc: Pos[];
  inside: string;
};
type Fence = FenceSegment[];

const read_input = (txt: string) => {
  const area = txt.split("\n").map((x) =>
    x.split("").map((x) => {
      const plot: Plot = {
        type: x,
        visited: false,
      };
      return plot;
    })
  );
  const n = area.length;
  const m = area[0].length;
  const farm: Farm = { area, n, m };
  return farm;
};

const is_inside = (pos: Pos, farm: Farm) => {
  return pos.v >= 0 && pos.v < farm.n && pos.h >= 0 && pos.h < farm.m;
};

const directions = [
  [1, 0], // down
  [0, 1], // right
  [-1, 0], // up
  [0, -1], // left
];

const explore_rec = (farm: Farm, start: Pos, region: Region) => {
  for (const d of directions) {
    const [dv, dh] = d;
    const pos = { v: start.v + dv, h: start.h + dh };
    const inside = is_inside(pos, farm);
    if (inside) {
      const visited = farm.area[pos.v][pos.h].visited;
      const same_type =
        farm.area[pos.v][pos.h].type === farm.area[start.v][start.h].type;
      if (same_type && !visited) {
        region.loc.push(pos);
        farm.area[pos.v][pos.h].visited = true;
        explore_rec(farm, pos, region);
      }
    }
  }
};

const get_region_from_pos = (farm: Farm, start: Pos) => {
  const loc: Pos[] = [];
  const type = farm.area[start.v][start.h].type;
  const region: Region = { type, loc };
  const visited = farm.area[start.v][start.h].visited;
  if (!visited) {
    region.loc.push(start);
    farm.area[start.v][start.h].visited = true;
  }

  explore_rec(farm, start, region);
  return region.loc.length > 0 ? region : null;
};

const get_regions = (farm: Farm) => {
  const regions: Region[] = [];
  d3.range(farm.n).forEach((v) => {
    d3.range(farm.m).forEach((h) => {
      const r = get_region_from_pos(farm, { v, h });
      if (r) {
        regions.push(r);
      }
    });
  });
  return regions;
};

const calc_region_props = (region: Region) => {
  const area = region.loc.length;

  const segments: FenceSegment[] = [];
  region.loc.forEach((e) => {
    for (const d of directions) {
      const [dv, dh] = d;
      const _v = e.v + dv;
      const _h = e.h + dh;
      const is_in_region = region.loc.find((x) => x.v === _v && x.h === _h);
      if (!is_in_region) {
        const segment: FenceSegment = { loc: [], inside: "" };
        if (dh === 0) {
          const _v = e.v + dv / 2;
          const _h1 = _h + 0.5;
          const _h2 = _h - 0.5;

          segment.loc = [{ v: _v, h: _h1 }, { v: _v, h: _h2 }];
          segment.inside = dv > 0 ? "up" : "down";
        } else if (dv === 0) {
          const _h = e.h + dh / 2;
          const _v1 = _v + 0.5;
          const _v2 = _v - 0.5;
          segment.loc = [{ v: _v1, h: _h }, { v: _v2, h: _h }];
          segment.inside = dh > 0 ? "left" : "right";
        } else {
          throw Error("UNEXPECTED");
        }
        segment.loc.sort((a, b) =>
          d3.ascending(a.v, b.v) || d3.ascending(a.h, b.h)
        );
        segments.push(segment);
      }
    }
  });

  const perim = segments.length;

  return { area, perim, segments };
};

const calc_sides = (segments: FenceSegment[]) => {
  // count vert/horizontal segments separately

  const groupV: { [v: number]: FenceSegment[] } = {};
  const groupH: { [h: number]: FenceSegment[] } = {};

  const v_values = [
    ...new Set(segments.map((e) => e.loc.map((x) => x.v)).flat()),
  ].sort();
  const h_values = [
    ...new Set(segments.map((e) => e.loc.map((x) => x.h)).flat()),
  ].sort();

  v_values.forEach((v) => {
    segments.forEach((e) => {
      if (e.loc[0].v === v && e.loc[1].v === v) {
        if (!groupV[v]) {
          groupV[v] = [];
        }
        // sort by h
        e.loc.sort((a, b) => d3.ascending(a.h, b.h));
        groupV[v].push(e);
      }
    });
  });

  h_values.forEach((h) => {
    segments.forEach((e) => {
      if (e.loc[0].h === h && e.loc[1].h === h) {
        if (!groupH[h]) {
          groupH[h] = [];
        }
        // sort by v
        e.loc.sort((a, b) => d3.ascending(a.v, b.v));
        groupH[h].push(e);
      }
    });
  });

  let n_side_v = 0;
  Object.values(groupV).forEach((g) => {
    // loc[0] contains segment smaller h
    // sort by segment by h
    g.sort((a, b) => d3.ascending(a.loc[0].h, b.loc[0].h));
    // at least one side
    n_side_v += 1;

    const arr = g.map((f) => ({ pos: f.loc[0], inside: f.inside }));
    arr.forEach((x, i) => {
      if (i > 0) {
        const prev_h = arr[i - 1].pos.h;
        const prev_inside = arr[i - 1].inside;
        const cur_h = x.pos.h;
        const cur_inside = x.inside;
        if (cur_h - prev_h > 1 || prev_inside !== cur_inside) {
          // increase n_side if not contiguous or different inside face
          n_side_v += 1;
        }
      }
    });
  });

  let n_side_h = 0;
  Object.values(groupH).forEach((g) => {
    // loc[0] contains segment smaller v
    // sort by segment by v
    g.sort((a, b) => d3.ascending(a.loc[0].v, b.loc[0].v));
    // at least one side
    n_side_h += 1;

    const arr = g.map((f) => ({ pos: f.loc[0], inside: f.inside }));
    arr.forEach((x, i) => {
      if (i > 0) {
        const prev_v = arr[i - 1].pos.v;
        const prev_inside = arr[i - 1].inside;
        const cur_v = x.pos.v;
        const cur_inside = x.inside;
        if (cur_v - prev_v > 1 || prev_inside !== cur_inside) {
          // increase n_side if not contiguous or different inside face
          n_side_v += 1;
        }
      }
    });
  });

  const n_side = n_side_v + n_side_h;

  return n_side;
};

const calc_price_1 = (regions: Region[]) => {
  let price = 0;
  for (const region of regions) {
    const { area, perim } = calc_region_props(region);
    const _price = area * perim;
    price += _price;
    // console.log({ area, perim, type: region.type, _price, price });
  }
  return price;
};

const calc_price_2 = (regions: Region[]) => {
  let price = 0;
  for (const region of regions) {
    const { area, segments } = calc_region_props(region);
    const n_side = calc_sides(segments);
    const _price = area * n_side;
    price += _price;
    // console.log({ area, n_side, type: region.type, _price, price });
  }
  return price;
};

//////////////// 1

{
  console.log("test-1a");
  const txt = u.read_txt_file("12-test-a.txt");

  const farm = read_input(txt);
  //   console.log({ farm });
  const regions = get_regions(farm);
  //   console.log({ regions });
  const price = calc_price_1(regions);
  console.log({ price });
}

{
  console.log("test-1b");
  const txt = u.read_txt_file("12-test-b.txt");

  const farm = read_input(txt);
  const regions = get_regions(farm);
  const price = calc_price_1(regions);
  console.log({ price });
}

{
  console.log("run-1");
  const txt = u.read_txt_file("12.txt");

  const farm = read_input(txt);
  const regions = get_regions(farm);
  const price = calc_price_1(regions);
  console.log({ price });
}

//////////////// 2

{
  console.log("test-2a");
  const txt = u.read_txt_file("12-test-a.txt");

  const farm = read_input(txt);
  const regions = get_regions(farm);
  const price = calc_price_2(regions);
  console.log({ price });
}

{
  console.log("test-2b");
  const txt = u.read_txt_file("12-test-b.txt");

  const farm = read_input(txt);
  const regions = get_regions(farm);
  const price = calc_price_2(regions);
  console.log({ price });
}

{
  console.log("test-2c");
  const txt = u.read_txt_file("12-test-c.txt");

  const farm = read_input(txt);
  const regions = get_regions(farm);
  const price = calc_price_2(regions);
  console.log({ price });
}

{
  console.log("test-2d");
  const txt = u.read_txt_file("12-test-d.txt");

  const farm = read_input(txt);
  const regions = get_regions(farm);
  const price = calc_price_2(regions);
  console.log({ price });
}

{
  console.log("test-2e");
  const txt = u.read_txt_file("12-test-e.txt");

  const farm = read_input(txt);
  const regions = get_regions(farm);
  const price = calc_price_2(regions.slice());
  console.log({ price });
}

{
  console.log("run-2");
  const txt = u.read_txt_file("12.txt");

  const farm = read_input(txt);
  const regions = get_regions(farm);
  const price = calc_price_2(regions);
  console.log({ price });
}
