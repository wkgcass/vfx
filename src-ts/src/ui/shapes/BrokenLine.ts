import { Group } from '../../javafx/Pane.js';
import type { Node } from '../../javafx/Node.js';
import { Point } from '../../entity/Point.js';
import type { Color } from '../../javafx/color.js';
import { VLine } from './VLine.js';
import { EndpointStyle } from './EndpointStyle.js';

function makePoints(points: number[]): Point[] {
  if (points.length % 2 !== 0) {
    throw new Error('points length must be an even number');
  }
  const ret: Point[] = [];
  let x: number | null = null;
  for (const p of points) {
    if (x === null) {
      x = p;
    } else {
      ret.push(new Point(x, p));
      x = null;
    }
  }
  return ret;
}

export class BrokenLine {
  private readonly lines: VLine[] = [];
  private readonly group: Group = new Group();

  constructor(width: number, ...rest: Array<number | Point>) {
    const points: Point[] = rest.length === 0
      ? []
      : typeof rest[0] === 'number'
        ? makePoints(rest as number[])
        : (rest as Point[]);
    this.init(width, points);
  }

  private init(width: number, points: Point[]): void {
    if (points.length < 2) {
      throw new Error('too few points to make a line');
    }
    for (let i = 1; i < points.length; i++) {
      const current = points[i]!;
      const previous = points[i - 1]!;

      const line = new VLine(width);
      this.lines.push(line);
      this.group.getChildren().add(line);

      line.setStart(previous.x, previous.y);
      line.setEnd(current.x, current.y);
    }
  }

  setStartStyle(style: EndpointStyle): void {
    this.lines[0]!.setStartStyle(style);
  }

  setEndStyle(style: EndpointStyle): void {
    this.lines[this.lines.length - 1]!.setEndStyle(style);
  }

  setStroke(color: Color): void {
    for (const l of this.lines) {
      l.setStroke(color);
    }
  }

  getNode(): Node {
    return this.group;
  }
}
