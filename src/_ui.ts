/// <reference path='../lib/openrct2.d.ts' />


/**
 * **********
 * Shared
 * **********
 */

/**
 * Toggles the visibility of owned construction rights
 * @param visible true if we are setting the rights visible
 */
export function setRightsVisibility(visible : boolean) : void {
  if (visible) {
    ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags | ViewportFlags.ConstructionRights;
  } else {
    ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags & ~ViewportFlags.ConstructionRights;
  }
}