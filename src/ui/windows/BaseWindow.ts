/// <reference path='../../../lib/openrct2.d.ts' />

import { WindowTemplate } from 'openrct2-flexui';
import { IWindow } from './IWindow';
import { UIElementID, WindowID } from '../types/enums';
import { UIElement } from '../types/types';





/**
 * **********
 * Classes
 * **********
 */

export abstract class BaseWindow implements IWindow {
  readonly windowId : WindowID;
  readonly windowTitle : string;
  protected template! : WindowTemplate;

  protected readonly uiElementMap : Partial<Record<UIElementID, UIElement>> = {};

  constructor(windowId : WindowID, windowTitle : string) {
    this.windowId = windowId;
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
  getUIElement(buttonId : UIElementID) : UIElement | undefined {
    return this.uiElementMap[buttonId];
  }
}