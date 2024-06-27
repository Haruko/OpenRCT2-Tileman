/// <reference path='../../lib/openrct2.d.ts' />

import { CoordsXY, isCoordsXY } from '@typedefs/CoordsXY';



/**
 * Makes a MapRange from two <x, y> coordinates, using the bounds of the rectangle they create to determine proper corners to define
 * @overload
 * @param c1 first corner
 * @param c2 second corner
 * @returns MapRange with leftTop and rightBottom built from minimums of coordinates
 */
export function MapRange(c1 : CoordsXY, c2 : CoordsXY) : MapRange;

/**
 * Makes a MapRange from two <x, y> coordinates, using the bounds of the rectangle they create to determine proper corners to define
 * @overload
 * @param x1 first corner x coordinate
 * @param y1 first corner y coordinate
 * @param x2 second corner x coordinate
 * @param y2 second corner y coordinate
 * @returns MapRange with leftTop and rightBottom built from minimums of coordinates
 */
export function MapRange(x1 : number, y1: number, x2 : number, y2 : number) : MapRange;

export function MapRange(a : any, b : any, x? : any, y? : any) : MapRange {
  if (typeof a === 'number' && typeof b === 'number') {
    return {
      leftTop: CoordsXY(Math.min(a, x), Math.min(b, y)),
      rightBottom: CoordsXY(Math.max(a, x), Math.max(b, y))
    } as MapRange;
  } else {
    return MapRange(a.x, a.y, b.x, b.y);
  }
}

/**
 * Checks if an object is instance of MapRange interface
 * @param obj object to check
 * @returns true if obj is an instance of MapRange interface
 */
export function isMapRange(obj : any) : obj is MapRange {
  const objAsMapRange = obj as MapRange;
  return typeof obj !== 'undefined'
    && (typeof objAsMapRange.leftTop !== 'undefined' && isCoordsXY(objAsMapRange.leftTop))
    && (typeof objAsMapRange.rightBottom !== 'undefined' && isCoordsXY(objAsMapRange.rightBottom));
}

/**
 * Calculates the number of tiles in an area of a MapRange
 * @param range Range to calculate from
 * @returns Number of tiles in MapRange
 */
export function getRangeSize(range : MapRange) : number {
  const xLength = Math.abs(range.rightBottom.x - range.leftTop.x) / 32 + 1;
  const yLength = Math.abs(range.rightBottom.y - range.leftTop.y) / 32 + 1;
  return xLength * yLength;
}

/**
 * Returns coordinates clamped to the map bounds
 * @param coords CoordsXY to clamp
 * @param range MapRange to clamp to
 * @returns Clamped CoordsXY
 */
export function clampCoords(coords : CoordsXY, range : MapRange) : CoordsXY {
  return CoordsXY(
    Math.min(range.rightBottom.x, Math.max(range.leftTop.x, coords.x)),
    Math.min(range.rightBottom.y, Math.max(range.leftTop.y, coords.y))
  );
}

/**
 * Clamp one range to conform to another
 * @param range Range to clamp
 * @param limitingRange Range to clamp to
 * @returns Range with clamped corners
 */
export function clampRange(range : MapRange, limitingRange : MapRange) : MapRange {
  return MapRange(
    clampCoords(range.leftTop, limitingRange),
    clampCoords(range.rightBottom, limitingRange)
  );
}

/**
 * Checks if the two ranges intersect
 * @param a 
 * @param b 
 * @returns true if they intersect
 */
export function rangesIntersect(a : MapRange, b : MapRange) : boolean {
  // Don't intersect along X
  if (a.rightBottom.x < b.leftTop.x || b.rightBottom.x < a.leftTop.x) {
    return false;
  }

  // Don't intersect along Y
  if (a.rightBottom.y < b.leftTop.y || b.rightBottom.y < a.leftTop.y) {
    return false;
  }

  return true;
}