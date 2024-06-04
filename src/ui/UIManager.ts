/// <reference path='../../lib/openrct2.d.ts' />

import { ViewportFlags } from 'openrct2-flexui';
import { WindowID } from './types/enums';
import { IWindow } from './windows/IWindow';





class TilemanUIManager {
  private readonly _windows : Record<WindowID, IWindow> = {} as Record<WindowID, IWindow>;

  constructor() {
    
  }

  /**
   * Registers a window to an id if it doesn't already exist
   * @param id ID to register to
   * @param window Window to register
   */
  public registerWindow(id : WindowID, window : IWindow) : void {
    if (typeof this._windows[id] === 'undefined') {
      this._windows[id] = window;
    }
  }

  /**
   * Gets a window instance
   * @param id ID to retrieve window of
   * @returns The window
   */
  public getWindow(id : WindowID) : IWindow {
    return this._windows[id];
  }

  /**
   * Toggles the visibility of owned construction rights
   * @param visible true if we are setting the rights visible
   */
  public setRightsVisibility(visible : boolean) : void {
    if (visible) {
      ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags | ViewportFlags.ConstructionRights;
    } else {
      ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags & ~ViewportFlags.ConstructionRights;
    }
  }
};

export const UIManager : TilemanUIManager = new TilemanUIManager();