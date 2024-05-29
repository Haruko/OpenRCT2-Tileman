/// <reference path='../../lib/openrct2.d.ts' />

import { WindowTemplate } from "openrct2-flexui";

export abstract class TilemanWindow {
  readonly windowTitle : string;
  readonly template : WindowTemplate;

  constructor(windowTitle : string) {
    this.windowTitle = windowTitle;

    this.template = this._buildWindowTemplate();
  }

  protected onUpdate() : void {
    const foundWindow : Window | undefined = this.getWindowInstance();
    
    if (typeof foundWindow !== 'undefined') {
      // Always clamp to the screen
      foundWindow.x = Math.max(0, Math.min(ui.width - foundWindow.width, foundWindow.x));
      foundWindow.y = Math.max(0, Math.min(ui.height - foundWindow.height, foundWindow.y));
    }
  }
  
  private getWindowInstance() : Window | undefined {
    for(let i = 0; i < ui.windows; ++i) {
      const win : Window = ui.getWindow(i);

      if (win.title === this.windowTitle) {
        return win;
      }
    }

    return;
  }

  /**
   * Builds the window template for initialization
   * @returns WindowTemplate
   */
  protected abstract _buildWindowTemplate() : WindowTemplate;
}