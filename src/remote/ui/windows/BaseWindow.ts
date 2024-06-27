/// <reference path='../../../../lib/openrct2.d.ts' />

import { WindowTemplate } from 'openrct2-flexui';
import { IWindow } from './IWindow';
import { ElementID, WindowID } from '../types/enums';
import { UIElement } from '../types/types';
import { Singleton } from '@src/Singleton';





/**
 * **********
 * Classes
 * **********
 */

export abstract class BaseWindow extends Singleton implements IWindow {
  readonly id : WindowID;
  readonly windowTitle : string;
  protected template! : WindowTemplate;

  private readonly _uiElementMap : Partial<Record<ElementID, UIElement>> = {};

  protected constructor(id : WindowID, windowTitle : string) {
    super();

    this.id = id;
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
   * Registers a new element to the list of elements
   * @param id ID to register to
   * @param el Element to register
   * @returns True if the instance was set, otherwise false 
   */
  protected registerElement(id : ElementID, el : UIElement) : boolean {
    if (typeof this._uiElementMap[id] === 'undefined') {
      this._uiElementMap[id] = el;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Gets a UI element from the map
   * @param id ElementID to get instance of
   * @returns Button instance
   */
  public getChildElement(id : ElementID) : UIElement | undefined {
    return this._uiElementMap[id];
  }
  
  

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
  public open() : void {
    this.template.open();
  }

  /**
   * Closes the window
   */
  public close() : void {
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
}