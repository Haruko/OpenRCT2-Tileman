/// <reference path='../../lib/openrct2.d.ts' />

import { CoordsXY, isCoordsXY } from './CoordsXY';

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