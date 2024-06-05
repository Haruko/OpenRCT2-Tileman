/// <reference path='../../lib/openrct2.d.ts' />

/**
 * **********
 * Variables
 * **********
 */

// Coordinates where tool was last used
let toolLastUsedCoords : CoordsXY = CoordsXY(0, 0);



/**
 * **********
 * Type / Interface / Enum definitions
 * **********
 */


export type ToolButtonID = ToolID | ButtonID; //ButtonID.BUY_TOOL | ButtonID.RIGHTS_TOOL | ButtonID.SELL_TOOL;



/**
 * **********
 * Tool Size and Location
 * **********
 */

/**
 * Exposes tool last used coordinates to other modules
 * @returns Current tool last used coordinates
 */
export function getToolLastUsedCoords() : CoordsXY {
  // TODO
  return toolLastUsedCoords;
}

/**
 * Sets the tool last used coordinates
 */
export function setToolLastUsedCoords(coords : CoordsXY) : void {
  // TODO
  toolLastUsedCoords = coords;
}



/**
 * **********
 * Events
 * **********
 */


/**
 * Called when the user holds left mouse button while using a tool
 * @param e event args
 */
export function onToolDown(toolId : ToolID, e : ToolEventArgs) : void {
  // TODO
  if (e.mapCoords && e.mapCoords.x > 0) {
    const toolArea = ToolManager.instance().getToolArea(e.mapCoords);
    ui.tileSelection.range = toolArea;
    applyToolToArea(toolId, toolArea);

    toolLastUsedCoords = e.mapCoords;
  } else {
    toolLastUsedCoords = CoordsXY(0, 0);
  }
}

/**
 * Called when the user moves the mouse while using a tool
 * @param e event args
 */
export function onToolMove(toolId : ToolID, e : ToolEventArgs) : void {
  // TODO
  if (e.mapCoords && e.mapCoords.x > 0) {
    const toolArea = ToolManager.instance().getToolArea(e.mapCoords);
    ui.tileSelection.range = toolArea;

    if (e.isDown && (e.mapCoords.x !== toolLastUsedCoords.x || e.mapCoords.y !== toolLastUsedCoords.y)) {
      applyToolToArea(toolId, toolArea);
      toolLastUsedCoords = e.mapCoords;
    }
  } else {
    ui.tileSelection.range = null;
    toolLastUsedCoords = CoordsXY(0, 0);
  }
}






/**
 * Applies the current tool to an area
 * @param area Area to apply the tool to
 */
export function applyToolToArea(toolId : ToolID, area : MapRange) : void {
  // TODO
  switch(toolId) {
    case ToolID.BUY:
      setTiles(area, LandOwnership.OWNED);
      break;
    case ToolID.RIGHTS:
      setTiles(area, LandOwnership.CONSTRUCTION_RIGHTS_OWNED);
      break;
    case ToolID.SELL:
      setTiles(area, LandOwnership.UNOWNED);
      break;
  }
}