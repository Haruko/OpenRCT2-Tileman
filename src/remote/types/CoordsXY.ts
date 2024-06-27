/// <reference path='../../../lib/openrct2.d.ts' />



/**
 * Makes a CoordsXY <0, 0>
 * @overload
 */
export function CoordsXY() : CoordsXY;

/**
 * Makes a CoordsXY from x and y values
 * @overload
 * @param x 
 * @param y 
 * @returns CoordsXY
 */
export function CoordsXY(x : number, y : number) : CoordsXY;

export function CoordsXY(x? : any, y? : any) : CoordsXY {
  if (typeof x === 'number') {
    return { x, y } as CoordsXY;
  } else {
    return { x: 0, y: 0 } as CoordsXY;
  }
}

/**
 * Checks if an object is instance of CoordsXY interface
 * @param obj object to check
 * @returns true if obj is an instance of CoordsXY interface
 */
export function isCoordsXY(obj : any) : obj is CoordsXY {
  const objAsCoordsXY = obj as CoordsXY;
  return typeof obj !== 'undefined'
    && typeof objAsCoordsXY.x !== 'undefined'
    && typeof objAsCoordsXY.y !== 'undefined' ;
}

/**
 * Checks if a CoordsXY is in the MapRange
 * @param coords CoordsXY to check
 * @param range MapRange to check
 */
export function isInRange(coords : CoordsXY, range : MapRange) : boolean {
  const x : boolean = range.leftTop.x <= coords.x && coords.x <= range.rightBottom.x;
  const y : boolean = range.leftTop.y <= coords.y && coords.y <= range.rightBottom.y;

  return x && y;
}