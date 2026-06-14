// Class-based enum because TS enums cannot carry per-constant fields.

export class SliderDirection {
  public static readonly LEFT_TO_RIGHT: SliderDirection = new SliderDirection('LEFT_TO_RIGHT', 0, true);
  public static readonly RIGHT_TO_LEFT: SliderDirection = new SliderDirection('RIGHT_TO_LEFT', 180, true);
  public static readonly TOP_TO_BOTTOM: SliderDirection = new SliderDirection('TOP_TO_BOTTOM', 90, false);
  public static readonly BOTTOM_TO_TOP: SliderDirection = new SliderDirection('BOTTOM_TO_TOP', -90, false);

  public static readonly values: readonly SliderDirection[] = [
    SliderDirection.LEFT_TO_RIGHT,
    SliderDirection.RIGHT_TO_LEFT,
    SliderDirection.TOP_TO_BOTTOM,
    SliderDirection.BOTTOM_TO_TOP,
  ];

  public readonly rotation: number;
  public readonly isHorizontal: boolean;
  public readonly isVertical: boolean;
  public readonly name: string;

  private constructor(name: string, rotation: number, isHorizontal: boolean) {
    this.name = name;
    this.rotation = rotation;
    this.isHorizontal = isHorizontal;
    this.isVertical = !isHorizontal;
  }

  toString(): string {
    return this.name;
  }
}
