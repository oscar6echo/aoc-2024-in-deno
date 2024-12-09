import d3 from "./shared/d3.ts";
import u from "./shared/util.ts";

console.log("START 9");

const read_disk_map = (txt: string) => {
  /** */

  const arr = txt.split("").filter((e) => e !== "\n").map((e) => parseInt(e));
  return arr;
};

type Block = {
  file_no?: number;
  start: number;
  length: number;
};

const prep_disk_map = (disk_map: number[]) => {
  const drive: number[] = [];
  const files: Block[] = [];
  const spaces: Block[] = [];

  let c = 0;
  disk_map.forEach((n_block, i) => {
    const is_block = i % 2 === 0;
    if (is_block) {
      const no = Math.round(i / 2);
      d3.range(n_block).forEach((_) => {
        drive.push(no);
      });
      files.push({ file_no: no, start: c, length: n_block });
    } else {
      d3.range(n_block).forEach((_) => {
        drive.push(-1);
      });
      if (n_block > 0) {
        spaces.push({ start: c, length: n_block });
      }
    }
    c += n_block;
  });

  return { drive, files, spaces };
};

const calc_checksum = (drive: number[]) => {
  let check_sum = 0;
  drive.forEach((e, i) => {
    if (e !== -1) {
      check_sum += i * e;
    }
  });

  return check_sum;
};

const compact_drive_by_block = (disk_map: number[]) => {
  const { drive } = prep_disk_map(disk_map);

  let beg = 0;
  let end = drive.length - 1;

  while (end > beg + 1) {
    while (drive[beg] !== -1) {
      beg += 1;
    }
    drive[beg] = drive[end];
    drive[end] = -1;

    end -= 1;
  }

  const check_sum = calc_checksum(drive);

  return check_sum;
};

const compact_drive_by_file = (disk_map: number[]) => {
  const { drive, files, spaces } = prep_disk_map(disk_map);
  //   console.log({ drive, files, spaces });

  for (const file of files.slice().reverse()) {
    for (const space of spaces) {
      if (space.start >= file.start) {
        break;
      }
      if (file.length <= space.length) {
        d3.range(file.length).forEach((i) => {
          drive[space.start + i] = drive[file.start + i];
          drive[file.start + i] = -1;
        });
        space.start += file.length;
        space.length -= file.length;
        break;
      }
    }
  }

  const check_sum = calc_checksum(drive);

  return check_sum;
};
//////////////// 1

{
  console.log("test-1");
  const txt = u.read_txt_file("9-test.txt");

  const disk_map = read_disk_map(txt);
  console.log({ disk_map });
  const check_sum = compact_drive_by_block(disk_map);

  console.log({ check_sum });
}

{
  console.log("run-1");
  const txt = u.read_txt_file("9.txt");

  const disk_map = read_disk_map(txt);
  const check_sum = compact_drive_by_block(disk_map);

  console.log({ check_sum });
}

///////////////////// 2

{
  console.log("test-2");
  const txt = u.read_txt_file("9-test.txt");

  const disk_map = read_disk_map(txt);
  //   console.log(disk_map);
  const check_sum = compact_drive_by_file(disk_map);

  console.log({ check_sum });
}

{
  console.log("run-2");
  const txt = u.read_txt_file("9.txt");

  const disk_map = read_disk_map(txt);
  const check_sum = compact_drive_by_file(disk_map);

  console.log({ check_sum });
}
