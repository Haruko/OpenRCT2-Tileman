/// <reference path='../lib/openrct2.d.ts' />

import * as FlexUI from 'openrct2-flexui';

import { getParkData, computeTilesUnlocked, getPluginConfig } from './data';
import { getToolSize, setToolSize, ToolID, cancelTool, onToolStart, onToolDown, onToolMove, onToolUp, onToolFinish } from './tool';



const ParkData = getParkData();
const PluginConfig = getPluginConfig();



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
 * UI construction
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

const UIDataStores = {
  // Total exp label
  totalExpLabelText : FlexUI.store<string>('{BABYBLUE}0'),
  totalExpLabelTextGenerator : () : string => {
    return `{BABYBLUE}${context.formatString('{COMMA16}', ParkData.totalExp.get())}`;
  },

  // Tiles unlocked/used/available
  tileTotalsLabelText : FlexUI.store<string>('{BABYBLUE}0{BLACK}/{RED}0{BLACK}/{GREEN}0'),
  tileTotalsLabelTextGenerator : () : string => {
    const tilesUnlocked = computeTilesUnlocked();

    return `{BABYBLUE}${context.formatString('{COMMA16}', tilesUnlocked)}` +
      `{BLACK}/{RED}${context.formatString('{COMMA16}', ParkData.tilesUsed.get())}` +
      `{BLACK}/{GREEN}${context.formatString('{COMMA16}', tilesUnlocked - ParkData.tilesUsed.get())}`;
  }
};

/**
 * Box to display statistics in primary window
 */
const statsPanel = FlexUI.box({
  content: FlexUI.vertical({
    spacing: 5,
    content: [
      FlexUI.horizontal({
        spacing: 0,
        content: [
          FlexUI.label({
            text: "{BLACK}Total Exp:",
            width: '175px'
          }),
          FlexUI.label({
            // UIDataStores.totalExpLabelTextGenerator()
            text: UIDataStores.totalExpLabelText
          })
        ]
      }),
      FlexUI.horizontal({
        spacing: 0,
        content: [
          FlexUI.label({
            text: "{BLACK}Tiles Unlocked/Used/Available: ",
            width: '175px'
          }),
          FlexUI.label({
            // UIDataStores.tileTotalsLabelTextGenerator
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
const buyButtonPressed : FlexUI.Store<boolean> = FlexUI.store<boolean>(false);
const rightsButtonPressed : FlexUI.Store<boolean> = FlexUI.store<boolean>(false);
const sellButtonPressed : FlexUI.Store<boolean> = FlexUI.store<boolean>(false);

const buyButton = FlexUI.button({
  image: Sprites.SPR_BUY_LAND_RIGHTS,
  tooltip: 'Buy land rights',
  width: '24px',
  height: '24px',
  onClick: () => onToolButtonClick(ToolID.BUY_TOOL),
  isPressed: buyButtonPressed
});

const rightsbutton = FlexUI.button({
  image: Sprites.SPR_BUY_CONSTRUCTION_RIGHTS,
  tooltip: 'Buy construction rights',
  width: '24px',
  height: '24px',
  onClick: () => onToolButtonClick(ToolID.RIGHTS_TOOL),
  isPressed: rightsButtonPressed
});

const sellButton = FlexUI.button({
  image: Sprites.SPR_FINANCE,
  tooltip: 'Sell land and construction rights',
  width: '24px',
  height: '24px',
  onClick: () => onToolButtonClick(ToolID.SELL_TOOL),
  isPressed: sellButtonPressed
});

const toolSizeSpinner = FlexUI.spinner({
  width: '62px',
  padding: ['5px', '5px'],
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
 * Box to display buttons in primary window
 */
const buttonPanel = FlexUI.vertical({
  spacing: 0,
  content: [
    FlexUI.horizontal({
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
const mainWindow = FlexUI.window({
  title: PluginConfig.winTitle,
	width: 300,
	height: 200,
  content: [
    FlexUI.vertical({
      spacing: 5,
      content: [
        statsPanel,
        buttonPanel
      ]
  })],
  onOpen: onWindowOpen,
  onUpdate: onWindowUpdate,
  onClose: onWindowClose
});

/**
 * Opens the primary window
 */
export function openWindow() : void {
  closeWindowInstances();
  setToolSize(PluginConfig.minToolSize);
  mainWindow.open();
}

/**
 * Closes all matching windows
 */
export function closeWindowInstances() : void {
  const numWindows = ui.windows;
  for(let i = numWindows - 1; i > 0; --i) {
    const win = ui.getWindow(i);
    if (win.title === PluginConfig.winTitle) {
      win.close();
    }
  }
}

/**
 * Update the labels in the window
 */
export function updateLabels() : void {
  // Update the total exp label
  UIDataStores.totalExpLabelText.set(UIDataStores.totalExpLabelTextGenerator());

  // Update the unlocked/used/available label
  UIDataStores.tileTotalsLabelText.set(UIDataStores.tileTotalsLabelTextGenerator());
}



/**
 * **********
 * Event Handlers
 * **********
 */

/**
 * Handles tool window's onOpen event
 */
export function onWindowOpen() : void {
  ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags | FlexUI.ViewportFlags.ConstructionRights;
}

/**
 * Handles tool window's onUpdate event
 */
export function onWindowUpdate() : void {
  return;
}

/**
 * Handles tool window's onClose event
 */
export function onWindowClose() : void {
  cancelTool();
  ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags ^ FlexUI.ViewportFlags.ConstructionRights;
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
 * **********
 * Others
 * **********
 */

/**
 * Pressed the specified button and depresses others
 * @param toolId ToolID whose button to press
 * @param pressed If defined, whether the button should be pressed or not. If undefined, use as a toggle
 * @returns final state of the specified button
 */
export function setToolButtonPressed(toolId : ToolID, pressed? : boolean) : boolean {
  console.log(toolId, pressed, ui.tool?.id);

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