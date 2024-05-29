/// <reference path='../lib/openrct2.d.ts' />

import { FlexiblePosition, Parsed, ViewportFlags, WidgetCreator } from 'openrct2-flexui';

import { getPluginConfig } from './data';
import { deleteGuests, deleteRides, fireStaff } from './park';
import { ToolID, cancelTool, onToolDown, onToolFinish, onToolMove, onToolStart, onToolUp } from './tool';
import { StatsWindow } from './ui/windows/StatsWindow';
import { ToolbarWindow } from './ui/windows/ToolbarWindow';
import { ConfigWindow } from './ui/windows/ConfigWindow';
import { ToggleButton } from './ui/elements/ToggleButton';

const PluginConfig = getPluginConfig();





/**
 * **********
 * Type / Interface / Enum definitions
 * **********
 */

// From openrct2/sprites.h
export enum Sprites {
  RENAME = 5168,
  BUY_LAND_RIGHTS = 5176,
  BUY_CONSTRUCTION_RIGHTS = 5177,
  FLOPPY = 5183,
  FINANCE = 5190,
  SEARCH = 29401,
  GRAPH = 29394,
};

export const AnimatedSprites = {
  GEARS: {
    frameBase: 5201,
    frameCount: 4,
    frameDuration: 4,
  },
  WRENCH: {
    frameBase: 5205,
    frameCount: 16,
    frameDuration: 4,
  },
  RESEARCH: {
    frameBase: 5327,
    frameCount: 8,
    frameDuration: 2,
  }
}

/**
 * A way to identify different buttons
 */
export enum ButtonID {
  // ToolbarWindow
  BUY_TOOL = PluginConfig.buyToolId,
  RIGHTS_TOOL = PluginConfig.rightsToolId,
  SELL_TOOL = PluginConfig.sellToolId,
  VIEW_RIGHTS_BUTTON = PluginConfig.viewRightsButtonId,
  OPEN_STATS_BUTTON = PluginConfig.openStatsButtonId,
  TOOL_SIZE_SPINNER = PluginConfig.toolSizeSpinnerId,

  // ConfigWindow
  FIRE_STAFF_BUTTON = PluginConfig.fireStaffButtonId,
  DELETE_GUESTS_BUTTON = PluginConfig.deleteGuestsButtonId,
  DELETE_RIDES_BUTTON = PluginConfig.deleteRidesButtonId,
  CLEAR_PARK_BUTTON = PluginConfig.clearParkButtonId,
};

export type ToggleButtonID = ButtonID.BUY_TOOL | ButtonID.RIGHTS_TOOL | ButtonID.SELL_TOOL | ButtonID.VIEW_RIGHTS_BUTTON | ButtonID.OPEN_STATS_BUTTON;

/**
 * Shorthand for all widget usage
 */
export type FlexUIWidget = WidgetCreator<FlexiblePosition, Parsed<FlexiblePosition>>;





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
 * Handles clicks on buttons
 * @param buttonId ButtonID that was clicked
 * @param pressed true if the button is pressed
 */
export function onButtonClick(buttonId : ButtonID, pressed : boolean) : void {
  switch (buttonId) {
    case ButtonID.BUY_TOOL:
    case ButtonID.RIGHTS_TOOL:
    case ButtonID.SELL_TOOL:
      const toolId = buttonId as unknown as ToolID;
      
      if (pressed) {
        ui.activateTool({
          id: ToolID[toolId],
          cursor: 'dig_down',
          filter: ['terrain', 'water'],
      
          onStart: () => onToolStart(toolId),
          onDown: (e: ToolEventArgs) => onToolDown(toolId, e),
          onMove: (e: ToolEventArgs) => onToolMove(toolId, e),
          onUp: (e: ToolEventArgs) => onToolUp(toolId, e),
          onFinish: () => onToolFinish(toolId)
        });
      } else {
        cancelTool();
      }

      break;
    case ButtonID.VIEW_RIGHTS_BUTTON:
      setRightsVisibility(pressed);
      break;
    case ButtonID.OPEN_STATS_BUTTON:
      if (pressed) {
        statsWindow.open();
      } else {
        statsWindow.close();
      }
      break;
    case ButtonID.FIRE_STAFF_BUTTON:
      fireStaff();
      break;
    case ButtonID.DELETE_GUESTS_BUTTON:
      deleteGuests();
      break;
    case ButtonID.DELETE_RIDES_BUTTON:
      deleteRides();
      break;
  }
}

/**
 * Closes all matching windows
 * @param windowId ID for windows to close
 */
// export function closeWindows(windowId : WindowID) : void {
//   let foundWindow : Window | undefined = findWindow(windowId);
  
//   while(typeof foundWindow !== 'undefined') {
//     foundWindow.close();
//     foundWindow = findWindow(windowId);
//   }
// }

/**
 * Toggles the visibility of owned construction rights
 * @param visible true if we are setting the rights visible
 */
export function setRightsVisibility(visible? : boolean) : void {
  if (typeof visible === 'undefined') {
    // Toggle on undefined
    // If flag is set, make visible false
    // If flag is not set, make visible true
    visible = (ui.mainViewport.visibilityFlags & ViewportFlags.ConstructionRights) !== ViewportFlags.ConstructionRights;
  }
  
  if (visible) {
    ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags | ViewportFlags.ConstructionRights;
    (toolbarWindow.getUIElement(ButtonID.VIEW_RIGHTS_BUTTON) as ToggleButton).press();
  } else {
    ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags & ~ViewportFlags.ConstructionRights;
    (toolbarWindow.getUIElement(ButtonID.VIEW_RIGHTS_BUTTON) as ToggleButton).depress();
  }
}