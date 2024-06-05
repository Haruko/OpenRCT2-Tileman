/// <reference path='../../../lib/openrct2.d.ts' />

import { ElementID } from '../types/enums';
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
   * Gets a UI element from the map
   * @param elementId ElementID to get instance of
   * @returns Button instance
   */
  getChildElement(elementId : ElementID) : UIElement | undefined ;
}