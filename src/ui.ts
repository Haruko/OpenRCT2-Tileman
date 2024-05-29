/// <reference path='../lib/openrct2.d.ts' />

import { FlexiblePosition, Parsed, TabCreator, ViewportFlags, WidgetCreator, WindowTemplate, horizontal, label, tab, tabwindow, vertical } from 'openrct2-flexui';

import { getPluginConfig } from './data';
import { deleteGuests, deleteRides, fireStaff } from './park';
import { ToolID, cancelTool, onToolDown, onToolFinish, onToolMove, onToolStart, onToolUp } from './tool';
import { DoubleClickButton } from './ui/DoubleClickButton';
import { StatefulButtonGroup } from './ui/ToggleButtonGroup';
import { ToolbarWindow } from './ui/ToolbarWindow';
import { StatsWindow } from './ui/StatsWindow';

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
 * A way to identify different windows
 */
export enum WindowID {
  CONFIG_WINDOW = PluginConfig.configWindowId,
};

/**
 * Shorthand for all widget usage
 */
export type FlexUIWidget = WidgetCreator<FlexiblePosition, Parsed<FlexiblePosition>>;





/**
 * **********
 * Variables
 * **********
 */

let fireStaffButton : DoubleClickButton;
let deleteGuestsButton : DoubleClickButton;
let deleteRidesButton : DoubleClickButton;

export const toolbarWindow : ToolbarWindow = new ToolbarWindow();
export const configWindow : WindowTemplate = buildConfigWindow();
export const statsWindow : StatsWindow = new StatsWindow();





/**
 * **********
 * UI Construction
 * **********
 */

/**
 * Config Window
 */

/**
 * Builds the entire config window
 * @returns the built window
 */
function buildConfigWindow() : WindowTemplate {
  const configTab : TabCreator = buildConfigTab();
  const debugTab : TabCreator = buildDebugTab();

  return tabwindow({
    title: PluginConfig.configWindowTitle,
    width: (90 * 3) + (3 * 4), // 3 buttons + 4 spacers
    height: 'auto',
    padding: 3,
    startingTab: 0,
    tabs: [
      configTab,
      debugTab,
    ],
    onOpen: () => onWindowOpen(WindowID.CONFIG_WINDOW),
    onUpdate: () => onWindowUpdate(WindowID.CONFIG_WINDOW),
    onClose: () => onWindowClose(WindowID.CONFIG_WINDOW)
  });
}

/**
 * Builds the config tab of the config window
 */
function buildConfigTab() : TabCreator {
  return tab({
    // image: {
    //   frameBase: Sprites.SPR_FLOPPY,
    //   offset: { x: 4, y: 1 },
    // },
    image: AnimatedSprites.RESEARCH,
    content: [
      label({
        text: '{WHITE}Config',
        height: 14
      }),
    ]
  });
}

/**
 * Builds the debug tab of the config window
 */
function buildDebugTab() : TabCreator {
  const buttonPanel = buildDebugButtonPanel();

  return tab({
    image: AnimatedSprites.WRENCH,
    content: [
      vertical({
        spacing: 2,
        padding: 0,
        content: [
          label({
            text: '{WHITE}Debug',
            height: 14
          }),
          buttonPanel,
        ]
      })
    ]
  });
}

/**
 * Builds panel to store buttons in debug tab of config window
 */
function buildDebugButtonPanel() : FlexUIWidget {
  const buttonGroup : StatefulButtonGroup = new StatefulButtonGroup();

  fireStaffButton = new DoubleClickButton(ButtonID.FIRE_STAFF_BUTTON, {
    text: 'Fire Staff',
    tooltip: 'Fires all staff',
    width: 90,
    height: 14,
    onChange: (pressed : boolean) => onButtonClick(ButtonID.FIRE_STAFF_BUTTON, true)
  }, buttonGroup);
  buttonGroup.addButton(fireStaffButton);

  deleteGuestsButton = new DoubleClickButton(ButtonID.DELETE_GUESTS_BUTTON, {
    text: 'Delete Guests',
    tooltip: 'Deletes the guests from the park',
    width: 90,
    height: 14,
    onChange: (pressed : boolean) => onButtonClick(ButtonID.DELETE_GUESTS_BUTTON, true)
  }, buttonGroup);
  buttonGroup.addButton(deleteGuestsButton);

  deleteRidesButton = new DoubleClickButton(ButtonID.DELETE_RIDES_BUTTON, {
    text: 'Delete Rides',
    tooltip: 'Deletes all rides from the park and removes their stats from exp calculation',
    width: 90,
    height: 14,
    onChange: (pressed : boolean) => onButtonClick(ButtonID.DELETE_RIDES_BUTTON, true)
  }, buttonGroup);
  buttonGroup.addButton(deleteRidesButton);

  const instructionLabel = label({
    text: '{WHITE}Double click to use buttons',
    alignment: 'centred',
    height: 14
  });

  return vertical({
    spacing: 2,
    padding: 0,
    content: [
      horizontal({
        spacing: 3,
        padding: 0,
        content: [
          fireStaffButton.widget,
          deleteGuestsButton.widget,
          deleteRidesButton.widget
        ]
      }),
      instructionLabel
    ]
  });
}





/**
 * **********
 * Shared
 * **********
 */

/**
 * Handles window's onOpen event
 */
export function onWindowOpen(windowId : WindowID) : void {
  switch (windowId) {
    case WindowID.CONFIG_WINDOW:

      break;
  }
}

/**
 * Handles window's onUpdate event
 */
export function onWindowUpdate(windowId : WindowID) : void {
  const foundWindow : Window | undefined = findWindow(windowId);

  if (typeof foundWindow !== 'undefined') {
    // Always clamp to the screen
    foundWindow.x = Math.max(0, Math.min(ui.width - foundWindow.width, foundWindow.x));
    foundWindow.y = Math.max(0, Math.min(ui.height - foundWindow.height, foundWindow.y));

    switch (windowId) {
      case WindowID.CONFIG_WINDOW:

        break;
    }
  }
}

/**
 * Handles window's onClose event
 */
export function onWindowClose(windowId : WindowID) : void {
  switch (windowId) {
    case WindowID.CONFIG_WINDOW:

      break;
  }
}

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
 * Opens matching window
 * @param windowId ID for window to open
 */
export function openWindow(windowId : WindowID) : void {
  const existingWindow : Window | undefined = findWindow(windowId);

  switch (windowId) {
    case WindowID.CONFIG_WINDOW:
      if (typeof existingWindow !== 'undefined') {
        closeWindows(windowId);
      }

      configWindow.open();
      break;
  }
}

/**
 * Closes all matching windows
 * @param windowId ID for windows to close
 */
export function closeWindows(windowId : WindowID) : void {
  let foundWindow : Window | undefined = findWindow(windowId);
  
  while(typeof foundWindow !== 'undefined') {
    foundWindow.close();
    foundWindow = findWindow(windowId);
  }
}

/**
 * Finds a window of a certain type
 * @param windowId ID to find
 * @returns the found Window or undefined
 */
export function findWindow(windowId : WindowID) : Window | undefined {
  const title = getWindowTitle(windowId);

  for(let i = 0; i < ui.windows; ++i) {
    const win : Window = ui.getWindow(i);
    if (win.title === title) {
      return win;
    }
  }

  return;
}

/**
 * Converts WindowID to string
 * @param windowId ID to get the title of
 */
export function getWindowTitle(windowId : WindowID) : string {
  switch (windowId) {
    case WindowID.CONFIG_WINDOW:
      return PluginConfig.configWindowTitle;
  }

  return '';
}

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
    toolbarWindow.getToggleButton(ButtonID.VIEW_RIGHTS_BUTTON).press();
  } else {
    ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags & ~ViewportFlags.ConstructionRights;
    toolbarWindow.getToggleButton(ButtonID.VIEW_RIGHTS_BUTTON).depress();
  }
}