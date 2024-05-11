/// <reference path='../lib/openrct2.d.ts' />

import { Store, ViewportFlags, WindowTemplate, box, button, horizontal, label, spinner, store, vertical, window } from 'openrct2-flexui';

import { computeTilesAvailable, getPluginConfig, StoreContainer, GeneratorContainer, getParkDataStores } from './data';
import { getToolSize, setToolSize, ToolID, cancelTool, onToolStart, onToolDown, onToolMove, onToolUp, onToolFinish } from './tool';



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

  // Unlocked tiles label text
  unlockedTilesText: () : string => {
    return `{WHITE}${ParkDataStores.tilesUsed.get()}`;
  },
};


/**
 * **********
 * Type / Interface / Enum definitions
 * **********
 */

// From openrct2/sprites.h
export enum Sprites {
  SPR_BUY_LAND_RIGHTS = 5176,
  SPR_BUY_CONSTRUCTION_RIGHTS = 5177,
  SPR_FINANCE = 5190
};



/**
 * **********
 * Toolbar Window
 * **********
 */

/**
 * Text colors
 *   black
 *   grey
 *   white
 *   red
 *   green
 *   yellow
 *   topaz
 *   celadon
 *   babyblue
 *   palelavender
 *   palegold
 *   lightpink
 *   pearlaqua
 *   palesilver
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
      expToNextTileLabel,
      unlockedTilesLabel
    ]
  })
});

/**
 * Buttons for buttonPanel
 */
const buyButtonPressed : Store<boolean> = store<boolean>(false);
const rightsButtonPressed : Store<boolean> = store<boolean>(false);
const sellButtonPressed : Store<boolean> = store<boolean>(false);

const buyButton = button({
  image: Sprites.SPR_BUY_LAND_RIGHTS,
  tooltip: 'Buy land rights',
  width: 24,
  height: 24,
  onClick: () => onToolButtonClick(ToolID.BUY_TOOL),
  isPressed: buyButtonPressed
});

const rightsbutton = button({
  image: Sprites.SPR_BUY_CONSTRUCTION_RIGHTS,
  tooltip: 'Buy construction rights',
  width: 24,
  height: 24,
  onClick: () => onToolButtonClick(ToolID.RIGHTS_TOOL),
  isPressed: rightsButtonPressed
});

const sellButton = button({
  image: Sprites.SPR_FINANCE,
  tooltip: 'Sell land and construction rights',
  width: 24,
  height: 24,
  onClick: () => onToolButtonClick(ToolID.SELL_TOOL),
  isPressed: sellButtonPressed
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
        toolSizeSpinner
      ]
    })
  ]
});

/**
 * Primary window
 */
const toolbarWindow : WindowTemplate = window({
  title: PluginConfig.toolbarWindowTitle,
	width: 150,
	height: 97,
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
  onOpen: onToolbarWindowOpen,
  onUpdate: onToolbarWindowUpdate,
  onClose: onToolbarWindowClose
});

/**
 * Handles toolbar window's onOpen event
 */
export function onToolbarWindowOpen() : void {
  ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags | ViewportFlags.ConstructionRights;
}

/**
 * Handles toolbar window's onUpdate event
 */
export function onToolbarWindowUpdate() : void {
  return;
}

/**
 * Handles toolbar window's onClose event
 */
export function onToolbarWindowClose() : void {
  let x : number = 0;
  let y : number = 0;

  const oldWindow : Window | undefined = findWindow(PluginConfig.toolbarWindowTitle);
  if (typeof oldWindow !== 'undefined') {
    x = oldWindow.x;
    y = oldWindow.y;
  }

  cancelTool();
  ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags & ~ViewportFlags.ConstructionRights;

  context.setTimeout(() : void => {
    openWindow(PluginConfig.toolbarWindowTitle);
    const foundWindow : Window | undefined = findWindow(PluginConfig.toolbarWindowTitle);
    if (typeof foundWindow !== 'undefined') {
      foundWindow.x = x;
      foundWindow.y = y;
    }
  }, 1);
}

/**
 * Handles clicks on tool buttons
 * @param toolId Tool ID for the button
 */
export function onToolButtonClick(toolId : ToolID) : void {
  // If the button is current depressed, it will be pressed, so start the tool
  // Button pressing and depressing will be handled in onToolStart and onToolFinish
  if(!getToolButtonPressed(toolId)) {
    ui.activateTool({
      id: toolId,
      cursor: 'dig_down',
      filter: ['terrain', 'water'],
  
      onStart: () => onToolStart(toolId),
      onDown: (e: ToolEventArgs) => onToolDown(e),
      onMove: (e: ToolEventArgs) => onToolMove(e),
      onUp: (e: ToolEventArgs) => onToolUp(e),
      onFinish: () => onToolFinish(toolId)
    });
  } else {
    cancelTool();
  }
}

/**
 * Pressed the specified button and depresses others
 * @param toolId ToolID whose button to press
 * @param pressed If defined, whether the button should be pressed or not. If undefined, use as a toggle
 * @returns final state of the specified button
 */
export function setToolButtonPressed(toolId : ToolID, pressed? : boolean) : boolean {
  switch(toolId) {
    case ToolID.BUY_TOOL:
      if (pressed === false) {
        // If false, just depress the button
        buyButtonPressed.set(false);
      } else {
        if (typeof pressed === 'undefined') {
          // If undefined, toggle it
          pressed = !buyButtonPressed.get();
        }

        buyButtonPressed.set(pressed);
        rightsButtonPressed.set(false);
        sellButtonPressed.set(false);
      }

      break;
    case ToolID.RIGHTS_TOOL:
      if (pressed === false) {
        // If false, just depress the button
        rightsButtonPressed.set(false);
      } else {
        if (typeof pressed === 'undefined') {
          // If undefined, toggle it
          pressed = !rightsButtonPressed.get();
        }

        buyButtonPressed.set(false);
        rightsButtonPressed.set(pressed);
        sellButtonPressed.set(false);
      }
      
      break;
    case ToolID.SELL_TOOL:
      if (pressed === false) {
        // If false, just depress the button
        sellButtonPressed.set(false);
      } else {
        if (typeof pressed === 'undefined') {
          // If undefined, toggle it
          pressed = !sellButtonPressed.get();
        }

        buyButtonPressed.set(false);
        rightsButtonPressed.set(false);
        sellButtonPressed.set(pressed);
      }

      break;
  }

  return pressed;
}

/**
 * Returns whether the specified tool's button is pressed or not
 * @param toolId ToolID whose button to press
 * @returns true if the tool's button is pressed
 */
export function getToolButtonPressed(toolId : ToolID) : boolean {
  switch(toolId) {
    case ToolID.BUY_TOOL:
      return buyButtonPressed.get();
    case ToolID.RIGHTS_TOOL:
      return rightsButtonPressed.get();
    case ToolID.SELL_TOOL:
      return sellButtonPressed.get();
  }
}


/**
 * **********
 * Shared
 * **********
 */

/**
 * Update the labels in the window
 */
export function updateLabels() : void {
  // Available tiles label text
  UIDataStores.availableTilesText.set(UIDataGenerators.availableTilesText());

  // Available tiles label text
  UIDataStores.expToNextTileText.set(UIDataGenerators.expToNextTileText());

  // Available tiles label text
  UIDataStores.unlockedTilesText.set(UIDataGenerators.unlockedTilesText());
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
 * Opens matching window
 * @param title title of the window to open
 */
export function openWindow(title : string) : void {
  updateLabels();

  switch (title) {
    case PluginConfig.toolbarWindowTitle:
      // Prevent infinite open/close loop
      const openWindow : Window | undefined = findWindow(PluginConfig.toolbarWindowTitle);

      if (typeof openWindow === 'undefined') {
        toolbarWindow.open();
      }

      break;
    case PluginConfig.configWindowTitle:
      closeWindowInstances(PluginConfig.configWindowTitle);
      // TODO: configWindow.open();
      break;
  }
}

/**
 * Closes all matching windows
 * @param title title of the windows to close
 */
export function closeWindowInstances(title : string) : void {
  let foundWindow : Window | undefined = findWindow(title);

  while(typeof foundWindow !== 'undefined') {
    foundWindow.close();
    foundWindow = findWindow(title);
  }
}