/// <reference path='../lib/openrct2.d.ts' />

import { Store, ViewportFlags, WindowTemplate, box, button, horizontal, label, spinner, store, vertical, window } from 'openrct2-flexui';

import { computeTilesUnlocked, getPluginConfig, StoreContainer, GeneratorContainer, getParkDataStores } from './data';
import { getToolSize, setToolSize, ToolID, cancelTool, onToolStart, onToolDown, onToolMove, onToolUp, onToolFinish } from './tool';



/**
 * **********
 * Variables
 * **********
 */

const ParkDataStores : StoreContainer = getParkDataStores();
const PluginConfig = getPluginConfig();

const UIDataStores : StoreContainer = {
  // Total exp label
  totalExpLabelText : store<string>('{BABYBLUE}0'),

  // Tiles unlocked/used/available
  tileTotalsLabelText : store<string>('{BABYBLUE}0{BLACK}/{RED}0{BLACK}/{GREEN}0'),
};

const UIDataGenerators : GeneratorContainer = {
  // Total exp label
  totalExpLabelText : () : string => {
    return `{BABYBLUE}${context.formatString('{COMMA16}', ParkDataStores.totalExp.get())}`;
  },

  // Tiles unlocked/used/available
  tileTotalsLabelText : () : string => {
    const tilesUnlocked = computeTilesUnlocked();

    return `{BABYBLUE}${context.formatString('{COMMA16}', tilesUnlocked)}` +
      `{BLACK}/{RED}${context.formatString('{COMMA16}', ParkDataStores.tilesUsed.get())}` +
      `{BLACK}/{GREEN}${context.formatString('{COMMA16}', tilesUnlocked - ParkDataStores.tilesUsed.get())}`;
  }
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
const statsPanel = box({
  content: vertical({
    spacing: 5,
    content: [
      horizontal({
        spacing: 0,
        content: [
          label({
            text: '{BLACK}Total Experience:',
            width: 175
          }),
          label({
            // UIDataGenerators.totalExpLabelText()
            text: UIDataStores.totalExpLabelText
          })
        ]
      }),
      horizontal({
        spacing: 0,
        content: [
          label({
            text: '{BLACK}Tiles Unlocked/Used/Available: ',
            width: 175
          }),
          label({
            // UIDataGenerators.tileTotalsLabelText()
            text: UIDataStores.tileTotalsLabelText
          })
        ]
      })
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
  padding: [5, 5],
  value: getToolSize(),
  minimum: PluginConfig.minToolSize,
  maximum: PluginConfig.maxToolSize + 1,
  step: 1,
  wrapMode: 'clamp',
  onChange: (value: number, adjustment: number) : void => {
    setToolSize(value);
  },
  format: (value: number) : string => {
    // Add spaces to center the text :) I am bigly smart
    return `${value}x${value}`;
  }
});

/**
 * Box to display buttons in toolbar window
 */
const buttonPanel = vertical({
  spacing: 0,
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
	width: 300,
	height: 200,
  content: [
    vertical({
      spacing: 5,
      content: [
        statsPanel,
        buttonPanel
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
  cancelTool();
  ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags & ~ViewportFlags.ConstructionRights;

  context.setTimeout(() : void => openWindow(PluginConfig.toolbarWindowTitle), 1);
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
  // Update the total exp label
  UIDataStores.totalExpLabelText.set(UIDataGenerators.totalExpLabelText());

  // Update the unlocked/used/available label
  UIDataStores.tileTotalsLabelText.set(UIDataGenerators.tileTotalsLabelText());
}

/**
 * Opens matching window
 */
export function openWindow(title : string) : void {
  updateLabels();

  switch (title) {
    case PluginConfig.toolbarWindowTitle:
      // Prevent infinite open/close loop
      let windowOpen : boolean = false;

      const numWindows : number = ui.windows;
      for(let i = numWindows - 1; i > 0; --i) {
        const win = ui.getWindow(i);
        if (win.title === PluginConfig.toolbarWindowTitle) {
          windowOpen = true;
        }
      }

      if (!windowOpen) {
        toolbarWindow.open();
      }

      break;
    case PluginConfig.configWindowTitle:
      closeWindowInstances(PluginConfig.configWindowTitle);
      // configWindow.open();
      break;
  }
}

/**
 * Closes all matching windows
 */
export function closeWindowInstances(title : string) : void {
  const numWindows : number = ui.windows;
  for(let i = numWindows - 1; i > 0; --i) {
    const win = ui.getWindow(i);
    if (win.title === title) {
      win.close();
    }
  }
}