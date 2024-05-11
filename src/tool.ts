/// <reference path='../lib/openrct2.d.ts' />

import { getPluginConfig } from './data';
import { LandOwnership, setTiles } from './land';
import { setToolButtonPressed } from './ui';

import { CoordsXY } from './types/CoordsXY';
import { MapRange } from './types/MapRange';
import { Store, store } from 'openrct2-flexui';



const PluginConfig = getPluginConfig();



/**
 * **********
 * Type / Interface / Enum definitions
 * **********
 */

export enum ToolID {
  BUY_TOOL = 'TilemanBuyTool',
  RIGHTS_TOOL = 'TilemanBuildRightsTool',
  SELL_TOOL = 'TilemanSellTool',
};



/**
 * **********
 * Variables
 * **********
 */

// Current tool size
let toolSize : Store<number> = store<number>(PluginConfig.minToolSize);

/**
 * Exposes tool size to other modules
 * @returns Current tool size
 */
export function getToolSize() : Store<number> {
  return toolSize;
}

/**
 * Sets the tool size
 */
export function setToolSize(size : number) : void {
  if (size >= PluginConfig.minToolSize && size <= PluginConfig.maxToolSize) {
    toolSize.set(size);
  }
}

// Coordinates where tool was last used
let toolLastUsedCoords : CoordsXY = CoordsXY(0, 0);

/**
 * Exposes tool last used coordinates to other modules
 * @returns Current tool last used coordinates
 */
export function getToolLastUsedCoords() : CoordsXY {
  return toolLastUsedCoords;
}

/**
 * Sets the tool last used coordinates
 */
export function setToolLastUsedCoords(coords : CoordsXY) : void {
  toolLastUsedCoords = coords;
}



/**
 * **********
 * Event Handlers
 * **********
 */

/**
 * Called when user starts using a tool
 */
export function onToolStart(toolId : ToolID) : void {
  setToolButtonPressed(toolId, true);
}

/**
 * Called when the user holds left mouse button while using a tool
 * @param e event args
 */
export function onToolDown(e : ToolEventArgs) : void {
  if (e.mapCoords && e.mapCoords.x > 0) {
    const toolArea = getToolArea(e.mapCoords);
    ui.tileSelection.range = toolArea;
    applyToolToArea(toolArea);

    toolLastUsedCoords = e.mapCoords;
  } else {
    toolLastUsedCoords = CoordsXY(0, 0);
  }
}

/**
 * Called when the user moves the mouse while using a tool
 * @param e event args
 */
export function onToolMove(e : ToolEventArgs) : void {
  if (e.mapCoords && e.mapCoords.x > 0) {
    const toolArea = getToolArea(e.mapCoords);
    ui.tileSelection.range = toolArea;

    if (e.isDown && (e.mapCoords.x !== toolLastUsedCoords.x || e.mapCoords.y !== toolLastUsedCoords.y)) {
      applyToolToArea(toolArea);
      toolLastUsedCoords = e.mapCoords;
    }
  } else {
    ui.tileSelection.range = null;
    toolLastUsedCoords = CoordsXY(0, 0);
  }
}

/**
 * Called when the user stops holding left mouse button while using a tool
 * @param e event args
 */
export function onToolUp(e : ToolEventArgs) : void {
  ui.tileSelection.range = null;
}

/**
 * Called when the user stops using a tool
 */
export function onToolFinish(toolId : ToolID) : void {
  setToolButtonPressed(toolId, false);
  ui.tileSelection.range = null;
}



/**
 * **********
 * Functions
 * **********
 */

/**
 * Cancels a tool being used
 */
export function cancelTool() : void {
  ui.tool?.cancel();
}

/**
 * Calculates the area around the tool that is affected by the tool
 * @param center Center point for the tool's usage
 * @returns MapRange for the affected area
 */
export function getToolArea(center : CoordsXY) : MapRange {
  const left   = Math.floor((center.x / 32) - ((toolSize.get() - 1) / 2)) * 32;
  const top    = Math.floor((center.y / 32) - ((toolSize.get() - 1) / 2)) * 32;
  const right  = Math.floor((center.x / 32) + ((toolSize.get() - 1) / 2)) * 32;
  const bottom = Math.floor((center.y / 32) + ((toolSize.get() - 1) / 2)) * 32;

  return MapRange(CoordsXY(left, top), CoordsXY(right, bottom));
}

/**
 * Applies the current tool to an area
 * @param area Area to apply the tool to
 */
export function applyToolToArea(area : MapRange) : void {
  switch(ui.tool?.id) {
    case ToolID.BUY_TOOL:
      setTiles(area, LandOwnership.OWNED);
      break;
    case ToolID.RIGHTS_TOOL:
      setTiles(area, LandOwnership.CONSTRUCTION_RIGHTS_OWNED);
      break;
    case ToolID.SELL_TOOL:
      setTiles(area, LandOwnership.UNOWNED);
      break;
  }
}