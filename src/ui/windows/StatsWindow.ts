/// <reference path='../../../lib/openrct2.d.ts' />

import { label, vertical, window, WindowTemplate } from 'openrct2-flexui';
import { ElementID, WindowID } from '../types/enums';
import { BaseWindow } from './BaseWindow';
import { IWindow } from './IWindow';
import { UIManager } from '../UIManager';
import { ToggleButton } from '../elements/ToggleButton';





export class StatsWindow extends BaseWindow {
  constructor() {
    super(WindowID.STATS, 'Tileman Statistics');

    this.template = this._buildWindowTemplate();
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

  protected _buildWindowTemplate() : WindowTemplate {
    return window({
      title: this.windowTitle,
      width: 175,
      height: 'auto',
      padding: 1,
      content: [
        vertical({
          spacing: 2,
          padding: 0,
          content: [
            label({
              text: 'Statistics'
            })
          ]
      })],
      onOpen: this.onOpen.bind(this),
      onUpdate: this.onUpdate.bind(this),
      onClose: this.onClose.bind(this)
    });
  }





  /**
   * **********
   * Event Handling
   * **********
   */

  /**
   * Handles onOpen event
   */
  protected override onOpen() : void {
    super.onOpen();

    const toolbarWindow : IWindow = UIManager.getInstance(WindowID.TOOLBAR);
    if (typeof toolbarWindow !== 'undefined') {
      const openStatsButton : ToggleButton = toolbarWindow.getChildElement(ElementID.OPEN_STATS_BUTTON) as ToggleButton;
      openStatsButton.press();
    }
  }

  /**
   * Handles window update event
   */
  protected override onUpdate() : void {
    super.onUpdate();
  }

  /**
   * Handles window close event
   */
  protected override onClose() : void {
    super.onClose();
    
    const toolbarWindow : IWindow = UIManager.getInstance(WindowID.TOOLBAR);
    if (typeof toolbarWindow !== 'undefined') {
      const openStatsButton : ToggleButton = toolbarWindow.getChildElement(ElementID.OPEN_STATS_BUTTON) as ToggleButton;
      openStatsButton.depress();
    }
  }
}