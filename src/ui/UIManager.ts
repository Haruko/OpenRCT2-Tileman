/// <reference path='../../lib/openrct2.d.ts' />

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
  registerWindow(id : WindowID, window : IWindow) : void {
    if (typeof this._windows[id] === 'undefined') {
      this._windows[id] = window;
    }
  }

  /**
   * Gets a window instance
   * @param id ID to retrieve window of
   * @returns The window
   */
  getWindow(id : WindowID) : IWindow {
    return this._windows[id];
  }
};

export const UIManager : TilemanUIManager = new TilemanUIManager();