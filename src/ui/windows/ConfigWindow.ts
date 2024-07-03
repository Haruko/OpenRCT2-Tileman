/// <reference path='../../../lib/openrct2.d.ts' />

import { WindowTemplate, tabwindow } from 'openrct2-flexui';
import { BaseWindow } from './BaseWindow';
import { WindowID } from '../types/enums';
import { DebugTab } from './tabs/DebugTab';
import { ConfigTab } from './tabs/ConfigTab';



export class ConfigWindow extends BaseWindow {
  private configTab! : ConfigTab;
  private debugTab! : DebugTab;
  
  protected constructor() {
    super(WindowID.CONFIG, 'Tileman Config', 470, undefined);

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
    this.configTab = new ConfigTab(this);
    this.debugTab = new DebugTab(this);
  
    return tabwindow({
      title: this.windowTitle,
      width: 'auto',
      height: 'auto',
      padding: { right: 5, rest: 6 },
      startingTab: 0,
      tabs: [
        this.configTab.getTemplate(),
        this.debugTab.getTemplate(),
      ],
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
  }
}