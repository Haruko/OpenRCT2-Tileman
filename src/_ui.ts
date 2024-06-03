/// <reference path='../lib/openrct2.d.ts' />

import { ViewportFlags } from 'openrct2-flexui';
import { ConfigWindow } from '@ui/windows/ConfigWindow';
import { StatsWindow } from '@ui/windows/StatsWindow';
import { ToolbarWindow } from '@ui/windows/ToolbarWindow';





/**
 * **********
 * Variables
 * **********
 */

export const toolbarWindow : ToolbarWindow = new ToolbarWindow();
export const configWindow : ConfigWindow = new ConfigWindow();
export const statsWindow : StatsWindow = new StatsWindow();





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