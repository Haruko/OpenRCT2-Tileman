/// <reference path='../../../lib/openrct2.d.ts' />

import { UIElementID } from '../types/enums';
import { UIElement } from '../types/types';





export interface IWindow {
  readonly windowTitle : string;

  /**
   * Opens the window
   */
  open() : void;
  
  /**
   * Closes the window
   */
  close() : void;
  
  /**
   * Gets a UI element from the UI map
   * @param buttonId ButtonID to get instance of
   * @returns Button instance
   */
  getUIElement(buttonId : UIElementID) : UIElement | undefined;
}