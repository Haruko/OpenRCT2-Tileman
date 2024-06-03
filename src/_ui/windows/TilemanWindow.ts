/// <reference path='../../../lib/openrct2.d.ts' />

import { WindowTemplate } from "openrct2-flexui";
import { ToggleButton } from "@ui/elements/ToggleButton";
import { IWindow } from './IWindow';
import { FlexUIWidget } from '@src/flexui-extension/FlexUIWidget';





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
  BUY_TOOL,
  RIGHTS_TOOL,
  SELL_TOOL,
  VIEW_RIGHTS_BUTTON,
  OPEN_STATS_BUTTON,
  TOOL_SIZE_SPINNER,

  // ConfigWindow
  FIRE_STAFF_BUTTON,
  DELETE_GUESTS_BUTTON,
  DELETE_RIDES_BUTTON,
  CLEAR_PARK_BUTTON,
};

export type ToggleButtonID = ButtonID.BUY_TOOL
                           | ButtonID.RIGHTS_TOOL
                           | ButtonID.SELL_TOOL
                           | ButtonID.VIEW_RIGHTS_BUTTON
                           | ButtonID.OPEN_STATS_BUTTON;



/**
 * **********
 * Classes
 * **********
 */

export abstract class TilemanWindow implements IWindow{
  readonly windowTitle : string;
  protected template! : WindowTemplate;

  protected readonly uiElementsMap : Partial<Record<ButtonID, ToggleButton | FlexUIWidget>> = {};

  constructor(windowTitle : string) {
    this.windowTitle = windowTitle;
  }
  


  /**
   * **********
   * Template Construction
   * **********
   */

  /**
   * Builds the window template for initialization
   * @returns WindowTemplate
   */
  protected abstract _buildWindowTemplate() : WindowTemplate;
  
  

  /**
   * **********
   * Event Handling
   * **********
   */

  /**
   * Handles onOpen event
   */
  protected onOpen() : void {

  }

  /**
   * Handles onUpdate event
   */
  protected onUpdate() : void {
    const foundWindow : Window | undefined = this.getWindowInstance();
    
    if (typeof foundWindow !== 'undefined') {
      // Always clamp to the screen
      foundWindow.x = Math.max(0, Math.min(ui.width - foundWindow.width, foundWindow.x));
      foundWindow.y = Math.max(0, Math.min(ui.height - foundWindow.height, foundWindow.y));
    }
  }

  /**
   * Handles onClose event
   */
  protected onClose() : void {
    
  }
  
  

  /**
   * **********
   * State Handling
   * **********
   */

  /**
   * Opens the window
   */
  open() : void {
    this.template.open();
  }

  /**
   * Closes the window
   */
  close() : void {
    this.template.close();
  }
  
  /**
   * Gets instance of this type of Window by title
   * @returns Window if found
   */
  protected getWindowInstance() : Window | undefined {
    for(let i = 0; i < ui.windows; ++i) {
      const win : Window = ui.getWindow(i);

      if (win.title === this.windowTitle) {
        return win;
      }
    }

    return;
  }

  /**
   * Gets a UI element from the UI map
   * @param buttonId ButtonID to get instance of
   * @returns Button instance
   */
  getUIElement(buttonId : ButtonID) : ToggleButton | FlexUIWidget | undefined {
    return this.uiElementsMap[buttonId];
  }
}