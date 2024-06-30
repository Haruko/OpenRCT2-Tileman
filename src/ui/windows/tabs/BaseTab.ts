/// <reference path='../../../../lib/openrct2.d.ts' />

import { IWindow } from '../IWindow';
import { TabCreator } from 'openrct2-flexui';
import { Templater } from '@src/ui/Templater';

export abstract class BaseTab extends Templater<TabCreator> {
  readonly parent : IWindow;

  protected constructor(parent : IWindow) {
    super();
    
    this.parent = parent;
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

  }

  /**
   * Handles onClose event
   */
  protected onClose() : void {
    
  }
}