/// <reference path='../lib/openrct2.d.ts' />

import { Colour, ViewportFlags, WindowTemplate, box, button, horizontal, label, spinner, store, vertical, window, WidgetCreator, FlexiblePosition, Parsed, tabwindow, tab, TabCreator } from 'openrct2-flexui';

import { computeTilesAvailable, getPluginConfig, StoreContainer, GeneratorContainer, getParkDataStores } from './data';
import { getToolSize, setToolSize, ToolID, cancelTool, onToolStart, onToolDown, onToolMove, onToolUp, onToolFinish } from './tool';
import { progressbar } from './ui/flexui-extenson';
import { deleteGuests, deleteRides, fireStaff } from './park';
import { ToggleButton } from './ui/ToggleButton';
import { StatefulButtonGroup } from './ui/ToggleButtonGroup';
import { DoubleClickButton } from './ui/DoubleClickButton';

const ParkDataStores : StoreContainer = getParkDataStores();
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
  BUY_TOOL = PluginConfig.buyToolId,
  RIGHTS_TOOL = PluginConfig.rightsToolId,
  SELL_TOOL = PluginConfig.sellToolId,
  VIEW_RIGHTS_BUTTON = PluginConfig.viewRightsButtonId,
  OPEN_STATS_BUTTON = PluginConfig.openStatsButtonId,
  FIRE_STAFF_BUTTON = PluginConfig.fireStaffButtonId,
  DELETE_GUESTS_BUTTON = PluginConfig.deleteGuestsButtonId,
  DELETE_RIDES_BUTTON = PluginConfig.deleteRidesButtonId,
  CLEAR_PARK_BUTTON = PluginConfig.clearParkButtonId,
};

/**
 * A way to identify different windows
 */
export enum WindowID {
  TOOLBAR_WINDOW = PluginConfig.toolbarWindowId,
  CONFIG_WINDOW = PluginConfig.configWindowId,
  STATS_WINDOW = PluginConfig.statsWindowId,
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

const UIDataStores : StoreContainer = {
  // Available tiles label text
  availableTilesText: store<string>('{RED}0'),

  // Exp to next tile label text
  expToNextTileText: store<string>(`{BABYBLUE}${PluginConfig.expPerTile}`),

  // Exp to next tile progress bar percent
  expToNextTilePercent: store<number>(0),

  // Exp to next tile progress bar foreground color
  expToNextTileBarForeground: store<Colour>(Colour.Grey),

  // Unlocked tiles label text
  unlockedTilesText: store<string>('{WHITE}0'),
};

const UIDataGenerators : GeneratorContainer = {
  // Available tiles label text
  availableTilesText: () : string => {
    const availableTiles : number = computeTilesAvailable();
    const textColor : string = (availableTiles === 0) ? 'RED' : 'BABYBLUE';

    return `{${textColor}}${context.formatString('{COMMA16}', availableTiles)}`;
  },

  // Exp to next tile label text
  expToNextTileText: () : string => {
    const expToNextTile : number = PluginConfig.expPerTile - (ParkDataStores.totalExp.get() % PluginConfig.expPerTile);

    return `{WHITE}${context.formatString('{COMMA16}', expToNextTile)}`;
  },

  // Exp to next tile progress bar percent
  expToNextTilePercent: () : number => {
    const expSinceLastTile : number = ParkDataStores.totalExp.get() % PluginConfig.expPerTile;

    return expSinceLastTile / PluginConfig.expPerTile;
  },

  // Exp to next tile progress bar foreground color
  expToNextTileBarForeground: () : Colour => {
    const expSinceLastTile : number = ParkDataStores.totalExp.get() % PluginConfig.expPerTile;
    const percent : number = expSinceLastTile / PluginConfig.expPerTile;

    if (percent > 0.80) {
      return Colour.BrightPurple;
    } else if (percent > 0.60) {
      return Colour.LightBlue;
    } else if (percent > 0.40) {
      return Colour.BrightGreen;
    } else if (percent > 0.20) {
      return Colour.BrightYellow;
    } else {
      return Colour.BrightRed;
    }
  },

  // Unlocked tiles label text
  unlockedTilesText: () : string => {
    return `{WHITE}${ParkDataStores.tilesUsed.get()}`;
  },
};

let buyToggleButton : ToggleButton;
let rightsToggleButton : ToggleButton;
let sellToggleButton : ToggleButton;
let viewRightsToggleButton : ToggleButton;

let fireStaffButton : DoubleClickButton;
let deleteGuestsButton : DoubleClickButton;
let deleteRidesButton : DoubleClickButton;

const toolbarWindow : WindowTemplate = buildToolbarWindow();
const configWindow : WindowTemplate = buildConfigWindow();
const statsWindow : WindowTemplate = buildStatsWindow();





/**
 * **********
 * UI Construction
 * **********
 */

/**
 * Toolbar Window
 */

/**
 * Builds the entire toolbar window
 * @returns the built window
 */
function buildToolbarWindow() : WindowTemplate {
  const statsPanel = buildToolbarStatsPanel();
  const buttonPanel = buildToolbarButtonPanel();

  return window({
    title: PluginConfig.toolbarWindowTitle,
    width: 200,
    height: 'auto',
    padding: 1,
    content: [
      vertical({
        spacing: 2,
        padding: 0,
        content: [
          buttonPanel,
          statsPanel
        ]
      })
    ],
    onOpen: () => onWindowOpen(WindowID.TOOLBAR_WINDOW),
    onUpdate: () => onWindowUpdate(WindowID.TOOLBAR_WINDOW),
    onClose: () => onWindowClose(WindowID.TOOLBAR_WINDOW)
  });
}

/**
 * Builds panel to store buttons in toolbar window
 */
function buildToolbarButtonPanel() : FlexUIWidget {
  const buttonGroup : StatefulButtonGroup = new StatefulButtonGroup();

  buyToggleButton = new ToggleButton(ButtonID.BUY_TOOL, {
    image: Sprites.BUY_LAND_RIGHTS,
    tooltip: 'Buy land rights',
    width: 24,
    height: 24,
    onChange: (pressed : boolean) => onButtonClick(ButtonID.BUY_TOOL, pressed),
  }, buttonGroup);
  buttonGroup.addButton(buyToggleButton);

  rightsToggleButton = new ToggleButton(ButtonID.RIGHTS_TOOL, {
    image: Sprites.BUY_CONSTRUCTION_RIGHTS,
    tooltip: 'Buy construction rights',
    width: 24,
    height: 24,
    onChange: (pressed : boolean) => onButtonClick(ButtonID.RIGHTS_TOOL, pressed),
  }, buttonGroup);
  buttonGroup.addButton(rightsToggleButton);

  sellToggleButton = new ToggleButton(ButtonID.SELL_TOOL, {
    image: Sprites.FINANCE,
    tooltip: 'Sell land and construction rights',
    width: 24,
    height: 24,
    onChange: (pressed : boolean) => onButtonClick(ButtonID.SELL_TOOL, pressed),
  }, buttonGroup);
  buttonGroup.addButton(sellToggleButton);
  
  viewRightsToggleButton = new ToggleButton(ButtonID.VIEW_RIGHTS_BUTTON, {
    image: Sprites.SEARCH,
    tooltip: 'Show owned construction rights',
    width: 24,
    height: 24,
    onChange: (pressed : boolean) => onButtonClick(ButtonID.VIEW_RIGHTS_BUTTON, pressed),
  });

  const openStatsButton = button({
    image: Sprites.GRAPH,
    tooltip: 'Open detailed statistics window',
    width: 24,
    height: 24,
    onClick: () => onButtonClick(ButtonID.OPEN_STATS_BUTTON)
  });
  
  const toolSizeSpinner = spinner({
    width: 62,
    padding: 5,
    value: getToolSize(),
    minimum: PluginConfig.minToolSize,
    maximum: PluginConfig.maxToolSize + 1,
    step: 1,
    wrapMode: 'clamp',
    onChange: (value: number, adjustment: number) : void => {
      setToolSize(value);
    },
    format: (value: number) : string => {
      return `${value}x${value}`;
    }
  });

  return horizontal({
    spacing: 0,
    padding: [0, 3],
    content: [
      toolSizeSpinner,
      buyToggleButton.widget,
      rightsToggleButton.widget,
      sellToggleButton.widget,
      viewRightsToggleButton.widget,
      openStatsButton,
    ]
  });
}

/**
 * Builds panel to display statistics in toolbar window
 */
function buildToolbarStatsPanel() : FlexUIWidget {
  const availableTilesLabel = horizontal({
    spacing: 0,
    content: [
      label({
        text: '  {BLACK}Available Tiles: ',
        width: 90
      }),
      label({
        // UIDataGenerators.availableTilesText()
        text: UIDataStores.availableTilesText
      })
    ]
  });
  
  const expToNextTileLabel = horizontal({
    spacing: 0,
    content: [
      label({
        text: '{BLACK}XP To Next Tile:',
        width: 90
      }),
      label({
        // UIDataGenerators.expToNextTileText()
        text: UIDataStores.expToNextTileText
      })
    ]
  });
  
  const expToNextTileProgressBar = progressbar({
    width: '1w',
    height: 10,
    background: Colour.Grey,
  
    // UIDataGenerators.expToNextTileBarForeground()
    foreground: UIDataStores.expToNextTileBarForeground,
  
    // UIDataGenerators.expToNextTilePercent()
    percentFilled: UIDataStores.expToNextTilePercent
  });
  
  const unlockedTilesLabel = horizontal({
    spacing: 0,
    content: [
      label({
        text: '   {BLACK}Tiles Unlocked:',
        width: 90
      }),
      label({
        // UIDataGenerators.unlockedTilesText()
        text: UIDataStores.unlockedTilesText
      })
    ]
  });
  
  return box({
    content: vertical({
      spacing: 0,
      content: [
        availableTilesLabel,
        unlockedTilesLabel,
        expToNextTileLabel,
        expToNextTileProgressBar
      ]
    })
  });
}

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
 * Detailed Statistics Window
 */

/**
 * Builds the entire detailed statistics window
 * @returns the built window
 */
function buildStatsWindow() : WindowTemplate {
  return window({
    title: PluginConfig.statsWindowTitle,
    width: 175,
    height: 'auto',
    padding: 1,
    content: [
      vertical({
        spacing: 2,
        padding: 0,
        content: [
          label({
            text: 'Statistics'
          })
        ]
    })],
    onOpen: () => onWindowOpen(WindowID.STATS_WINDOW),
    onUpdate: () => onWindowUpdate(WindowID.STATS_WINDOW),
    onClose: () => onWindowClose(WindowID.STATS_WINDOW)
  });
}





/**
 * **********
 * Shared
 * **********
 */

/**
 * Handles toolbar window's onOpen event
 */
export function onWindowOpen(windowId : WindowID) : void {
  switch (windowId) {
    case WindowID.TOOLBAR_WINDOW:

      break;
    case WindowID.CONFIG_WINDOW:

      break;
    case WindowID.STATS_WINDOW:

      break;
  }
}

/**
 * Handles toolbar window's onUpdate event
 */
export function onWindowUpdate(windowId : WindowID) : void {
  const foundWindow : Window | undefined = findWindow(windowId);

  if (typeof foundWindow !== 'undefined') {
    // Always clamp to the screen
    foundWindow.x = Math.max(0, Math.min(ui.width - foundWindow.width, foundWindow.x));
    foundWindow.y = Math.max(0, Math.min(ui.height - foundWindow.height, foundWindow.y));

    switch (windowId) {
      case WindowID.TOOLBAR_WINDOW:

        break;
      case WindowID.CONFIG_WINDOW:

        break;
      case WindowID.STATS_WINDOW:
  
        break;
    }
  }
}

/**
 * Handles toolbar window's onClose event
 */
export function onWindowClose(windowId : WindowID) : void {
  switch (windowId) {
    case WindowID.TOOLBAR_WINDOW:
      openWindow(WindowID.TOOLBAR_WINDOW);
      break;
    case WindowID.CONFIG_WINDOW:

      break;
    case WindowID.STATS_WINDOW:

      break;
  }
}

/**
 * Handles clicks on buttons
 * @param buttonId ButtonID that was clicked
 * @param pressed true if the button is pressed
 */
export function onButtonClick(buttonId : ButtonID, pressed? : boolean) : void {
  if (typeof pressed === 'undefined') {
    pressed = isButtonPressed(buttonId);
  }

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
      openWindow(WindowID.STATS_WINDOW);
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
  updateUIData();

  switch (windowId) {
    case WindowID.TOOLBAR_WINDOW:
      let x : number = 0;
      let y : number = 0;
    
      const oldWindow : Window | undefined = findWindow(WindowID.TOOLBAR_WINDOW);
      if (typeof oldWindow === 'undefined') {
        // Didn't have the window open yet
        toolbarWindow.open();
      } else {
        // Already had an instance of the window open
        x = oldWindow.x;
        y = oldWindow.y;
        
        // Delay this so we make sure the old window is open before opening a new one
        context.setTimeout(() : void => {
          toolbarWindow.open();

          const foundWindow : Window | undefined = findWindow(WindowID.TOOLBAR_WINDOW);
          if (typeof foundWindow !== 'undefined') {
            foundWindow.x = x;
            foundWindow.y = y;
          }
        }, 1);
      }
      break;
    case WindowID.CONFIG_WINDOW:
      closeWindows(WindowID.CONFIG_WINDOW);
      configWindow.open();
      break;
    case WindowID.STATS_WINDOW:
      closeWindows(WindowID.STATS_WINDOW);
      statsWindow.open();
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
    case WindowID.TOOLBAR_WINDOW:
      return PluginConfig.toolbarWindowTitle;
    case WindowID.CONFIG_WINDOW:
      return PluginConfig.configWindowTitle;
    case WindowID.STATS_WINDOW:
      return PluginConfig.statsWindowTitle;
  }
}

/**
 * Update the labels in the window
 */
export function updateUIData() : void {
  // Available tiles label text
  UIDataStores.availableTilesText.set(UIDataGenerators.availableTilesText());

  // Exp to next tile label text
  UIDataStores.expToNextTileText.set(UIDataGenerators.expToNextTileText());

  // Exp to next tile progress bar percent
  UIDataStores.expToNextTilePercent.set(UIDataGenerators.expToNextTilePercent());

  // Exp to next tile progress bar foreground color
  UIDataStores.expToNextTileBarForeground.set(UIDataGenerators.expToNextTileBarForeground());

  // Unlocked tiles label text
  UIDataStores.unlockedTilesText.set(UIDataGenerators.unlockedTilesText());
}

/**
 * Presses the specified button and depresses others.
 * @param id ButtonID to cli1ck or ToolID whose button should be clicked
 * @param press If defined, whether the button should be pressed or not. If undefined, use as a toggle
 */
export function setButtonPressed(id : ButtonID | ToolID, press? : boolean) : void {
  if (id in ToolID) {
    id = id as unknown as ButtonID;
  }

  switch (id) {
    case ButtonID.BUY_TOOL:
      if (typeof press === 'undefined') {
        buyToggleButton.toggle();
      } else if (press) {
        buyToggleButton.press();
      } else {
        buyToggleButton.depress();
      }

      break;
    case ButtonID.RIGHTS_TOOL:
      if (typeof press === 'undefined') {
        rightsToggleButton.toggle();
      } else if (press) {
        rightsToggleButton.press();
      } else {
        rightsToggleButton.depress();
      }

      break;
    case ButtonID.SELL_TOOL:
      if (typeof press === 'undefined') {
        sellToggleButton.toggle();
      } else if (press) {
        sellToggleButton.press();
      } else {
        sellToggleButton.depress();
      }

      break;
    case ButtonID.VIEW_RIGHTS_BUTTON:
      if (typeof press === 'undefined') {
        viewRightsToggleButton.toggle();
      } else if (press) {
        viewRightsToggleButton.press();
      } else {
        viewRightsToggleButton.depress();
      }
    break;
  }
}

/**
 * Returns whether the button is pressed or not
 * @param buttonId ButtonID to check
 * @returns true if the button is pressed
 */
export function isButtonPressed(buttonId : ButtonID) : boolean {
  switch (buttonId) {
    case ButtonID.BUY_TOOL:
      return buyToggleButton.isPressed();
    case ButtonID.RIGHTS_TOOL:
      return rightsToggleButton.isPressed();
    case ButtonID.SELL_TOOL:
      return sellToggleButton.isPressed();
    case ButtonID.VIEW_RIGHTS_BUTTON:
      return viewRightsToggleButton.isPressed();
    default:
      return false;
  }
}

/**
 * Toggles the visibility of owned construction rights
 * @param visible true if we are setting the rights visible
 */
export function setRightsVisibility(visible : boolean) : void {
  if (typeof visible === 'undefined') {
    ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags ^ ViewportFlags.ConstructionRights;
  } else if (visible) {
    ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags | ViewportFlags.ConstructionRights;
  } else {
    ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags & ~ViewportFlags.ConstructionRights;
  }
}