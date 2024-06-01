/// <reference path='../../../lib/openrct2.d.ts' />

import { WindowTemplate, label, vertical, window } from "openrct2-flexui";
import { getPluginConfig } from "@src/data";
import { TilemanWindow } from "@ui/windows/TilemanWindow";
import { ButtonID, toolbarWindow } from "@src/ui";
import { ToggleButton } from "@ui/elements/ToggleButton";

const PluginConfig = getPluginConfig();





export class StatsWindow extends TilemanWindow {
  constructor() {
    super(PluginConfig.statsWindowTitle);
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
    (toolbarWindow.getUIElement(ButtonID.OPEN_STATS_BUTTON) as ToggleButton).press();
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
    (toolbarWindow.getUIElement(ButtonID.OPEN_STATS_BUTTON) as ToggleButton).depress();
  }
}