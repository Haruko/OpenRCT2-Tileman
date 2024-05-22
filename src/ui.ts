/// <reference path='../lib/openrct2.d.ts' />

import { toggle, Colour, ViewportFlags, WindowTemplate, WritableStore, box, button, horizontal, label, spinner, store, vertical, window } from 'openrct2-flexui';

import { computeTilesAvailable, getPluginConfig, StoreContainer, GeneratorContainer, getParkDataStores } from './data';
import { getToolSize, setToolSize, ToolID, cancelTool, onToolStart, onToolDown, onToolMove, onToolUp, onToolFinish } from './tool';
import { progressbar } from './flexui-extenson';



/**
 * **********
 * Variables
 * **********
 */

const ParkDataStores : StoreContainer = getParkDataStores();
const PluginConfig = getPluginConfig();

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

const UIButtonStateStores : StoreContainer = {
  buyButtonState: store<boolean>(false),
  rightsButtonState: store<boolean>(false),
  sellButtonState: store<boolean>(false),
  viewRightsButtonState: store<boolean>(false),
}



/**
 * **********
 * Type / Interface / Enum definitions
 * **********
 */

// From openrct2/sprites.h
export enum Sprites {
  SPR_BUY_LAND_RIGHTS = 5176,
  SPR_BUY_CONSTRUCTION_RIGHTS = 5177,
  SPR_FINANCE = 5190,
  SPR_G2_SEARCH = 29401,
};

/**
 * A way to identify different buttons
 */
export enum ButtonID {
  BUY_TOOL = PluginConfig.buyToolId,
  RIGHTS_TOOL = PluginConfig.rightsToolId,
  SELL_TOOL = PluginConfig.sellToolId,
  VIEW_RIGHTS_BUTTON = PluginConfig.viewRightsButtonId,
};

/**
 * A way to identify different windows
 */
export enum WindowID {
  TOOLBAR_WINDOW = PluginConfig.toolbarWindowId,
  CONFIG_WINDOW = PluginConfig.configWindowId,
};



/**
 * **********
 * Toolbar Window
 * **********
 */

/**
 * Box to display statistics in toolbar window
 */
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

const statsPanel = box({
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

/**
 * Buttons for buttonPanel
 */
const buyButton = toggle({
  image: Sprites.SPR_BUY_LAND_RIGHTS,
  tooltip: 'Buy land rights',
  width: 24,
  height: 24,
  onChange: () => onButtonClick(ButtonID.BUY_TOOL),
  isPressed: { twoway: UIButtonStateStores.buyButtonState }
});

const rightsbutton = toggle({
  image: Sprites.SPR_BUY_CONSTRUCTION_RIGHTS,
  tooltip: 'Buy construction rights',
  width: 24,
  height: 24,
  onChange: () => onButtonClick(ButtonID.RIGHTS_TOOL),
  isPressed: { twoway: UIButtonStateStores.rightsButtonState }
});

const sellButton = toggle({
  image: Sprites.SPR_FINANCE,
  tooltip: 'Sell land and construction rights',
  width: 24,
  height: 24,
  onChange: () => onButtonClick(ButtonID.SELL_TOOL),
  isPressed: { twoway: UIButtonStateStores.sellButtonState }
});

const viewRightsButton = toggle({
  image: Sprites.SPR_G2_SEARCH,
  tooltip: 'Show owned construction rights',
  width: 24,
  height: 24,
  onChange: () => onButtonClick(ButtonID.VIEW_RIGHTS_BUTTON),
  isPressed: { twoway: UIButtonStateStores.viewRightsButtonState }
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

/**
 * Box to display buttons in toolbar window
 */
const buttonPanel = vertical({
  spacing: 0,
  padding: [0, 3],
  content: [
    horizontal({
      spacing: 0,
      content: [
        buyButton,
        rightsbutton,
        sellButton,
        viewRightsButton,
        toolSizeSpinner
      ]
    })
  ]
});

/**
 * Main window
 */
const toolbarWindow : WindowTemplate = window({
  title: PluginConfig.toolbarWindowTitle,
	width: 175,
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
  })],
  onOpen: () => onWindowOpen(WindowID.TOOLBAR_WINDOW),
  onUpdate: () => onWindowUpdate(WindowID.TOOLBAR_WINDOW),
  onClose: () => onWindowClose(WindowID.TOOLBAR_WINDOW)
});



/**
 * **********
 * Toolbar Window
 * **********
 */


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
    case WindowID.CONFIG_WINDOW:

      break;
    case WindowID.TOOLBAR_WINDOW:

      break;
  }
}

/**
 * Handles toolbar window's onUpdate event
 */
export function onWindowUpdate(windowId : WindowID) : void {
  switch (windowId) {
    case WindowID.CONFIG_WINDOW:

      break;
    case WindowID.TOOLBAR_WINDOW:

      break;
  }
}

/**
 * Handles toolbar window's onClose event
 */
export function onWindowClose(windowId : WindowID) : void {
  switch (windowId) {
    case WindowID.CONFIG_WINDOW:

      break;
    case WindowID.TOOLBAR_WINDOW:
      let x : number = 0;
      let y : number = 0;
    
      const oldWindow : Window | undefined = findWindow(PluginConfig.toolbarWindowTitle);
      if (typeof oldWindow !== 'undefined') {
        x = oldWindow.x;
        y = oldWindow.y;
      }
    
      context.setTimeout(() : void => {
        openWindow(PluginConfig.toolbarWindowTitle);
        const foundWindow : Window | undefined = findWindow(PluginConfig.toolbarWindowTitle);
        if (typeof foundWindow !== 'undefined') {
          foundWindow.x = x;
          foundWindow.y = y;
        }
      }, 1);
      break;
  }
}

/**
 * Handles clicks on buttons
 * @param buttonId ButtonID that was clicked
 */
export function onButtonClick(buttonId : ButtonID) : void {
  const pressed = isButtonPressed(buttonId);

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
  }
}

/**
 * Opens matching window
 * @param title title of the window to open
 */
export function openWindow(title : string) : void {
  updateUIData();

  switch (title) {
    case PluginConfig.toolbarWindowTitle:
      // Prevent infinite open/close loop
      const openWindow : Window | undefined = findWindow(PluginConfig.toolbarWindowTitle);

      if (typeof openWindow === 'undefined') {
        toolbarWindow.open();
      }

      break;
    case PluginConfig.configWindowTitle:
      closeWindows(PluginConfig.configWindowTitle);
      // TODO: configWindow.open();
      break;
  }
}

/**
 * Closes all matching windows
 * @param title title of the windows to close
 */
export function closeWindows(title : string) : void {
  let foundWindow : Window | undefined = findWindow(title);

  while(typeof foundWindow !== 'undefined') {
    foundWindow.close();
    foundWindow = findWindow(title);
  }
}

/**
 * Finds a window of a certain type
 * @param title title of the window to find
 * @returns the found Window or undefined
 */
export function findWindow(title : string) : Window | undefined {
  for(let i = 0; i < ui.windows; ++i) {
    const win : Window = ui.getWindow(i);
    if (win.title === title) {
      return win;
    }
  }

  return;
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
 * @param id ButtonID to click or ToolID whose button should be clicked
 * @param pressed If defined, whether the button should be pressed or not. If undefined, use as a toggle
 */
export function setButtonPressed(id : ButtonID | ToolID, pressed? : boolean) : void {
  if (id in ToolID) {
    id = id as unknown as ButtonID;
  }

  switch (id) {
    case ButtonID.BUY_TOOL:
      if (pressed === false) {
        // If false, just depress the button
        UIButtonStateStores.buyButtonState.set(false);
      } else {
        if (typeof pressed === 'undefined') {
          // If undefined, toggle it
          pressed = !UIButtonStateStores.buyButtonState.get();
        }

        UIButtonStateStores.buyButtonState.set(pressed);
        UIButtonStateStores.rightsButtonState.set(false);
        UIButtonStateStores.sellButtonState.set(false);
      }

      break;
    case ButtonID.RIGHTS_TOOL:
      if (pressed === false) {
        // If false, just depress the button
        UIButtonStateStores.rightsButtonState.set(false);
      } else {
        if (typeof pressed === 'undefined') {
          // If undefined, toggle it
          pressed = !UIButtonStateStores.rightsButtonState.get();
        }

        UIButtonStateStores.buyButtonState.set(false);
        UIButtonStateStores.rightsButtonState.set(pressed);
        UIButtonStateStores.sellButtonState.set(false);
      }

      break;
    case ButtonID.SELL_TOOL:
      if (pressed === false) {
        // If false, just depress the button
        UIButtonStateStores.sellButtonState.set(false);
      } else {
        if (typeof pressed === 'undefined') {
          // If undefined, toggle it
          pressed = !UIButtonStateStores.sellButtonState.get();
        }

        UIButtonStateStores.buyButtonState.set(false);
        UIButtonStateStores.rightsButtonState.set(false);
        UIButtonStateStores.sellButtonState.set(pressed);
      }

      break;
    case ButtonID.VIEW_RIGHTS_BUTTON:
      if (typeof pressed === 'undefined') {
        pressed = !UIButtonStateStores.viewRightsButtonState.get();
      }

      UIButtonStateStores.viewRightsButtonState.set(pressed);
      setRightsVisibility(pressed);
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
      return UIButtonStateStores.buyButtonState.get();
    case ButtonID.RIGHTS_TOOL:
      return UIButtonStateStores.rightsButtonState.get();
    case ButtonID.SELL_TOOL:
      return UIButtonStateStores.sellButtonState.get();
    case ButtonID.VIEW_RIGHTS_BUTTON:
      return UIButtonStateStores.viewRightsButtonState.get();
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