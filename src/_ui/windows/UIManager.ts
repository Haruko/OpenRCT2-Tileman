/// <reference path='../../../lib/openrct2.d.ts' />

import { IWindow } from '@ui/windows/IWindow';

export enum WindowID {
  TOOLBAR,
  CONFIG,
  STATS,
};

export class UIManager {
  private static _instance : UIManager;
  private _windows : Record<WindowID, IWindow> = {} as Record<WindowID, IWindow>;

  private constructor() {}

  /**
   * Makes sure we only ever have one instance of this class
   * @returns The single instance of this class
   */
  static instance() : UIManager {
    if (typeof this._instance === 'undefined') {
      this._instance = new UIManager();
    }

    return this._instance;
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