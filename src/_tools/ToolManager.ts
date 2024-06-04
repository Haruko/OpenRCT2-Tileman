/// <reference path='../../lib/openrct2.d.ts' />

import { Store, WritableStore, store } from 'openrct2-flexui';
import { MapRange } from '@src/types/MapRange';
import { CoordsXY } from '@src/types/CoordsXY';
import { PluginConfig } from '@src/_data';
import { ToggleButton } from '@src/_ui/elements/ToggleButton';
import { ButtonID } from '@src/_ui/windows/TilemanWindow';
import { IWindow } from '@src/_ui/windows/IWindow';
import { UIManager, WindowID } from '@src/_ui/windows/UIManager';
import { ITool } from './ITool';





export enum ToolID {
  BUY = 'Tileman-BuyTool',
  RIGHTS = 'Tileman-RightsTool',
  SELL = 'Tileman-SellTool'
};



export class ToolManager {
  private static _instance : ToolManager;

  // Stores tools
  private _tools : Record<ToolID, ITool> = {} as Record<ToolID, ITool>;

  private _activeToolId : ToolID | null = null;
  private readonly _toolSize : WritableStore<number> = store<number>(PluginConfig.minToolSize);

  private _viewRightsStateCache : boolean = false;

  private constructor() {}

  /**
   * Makes sure we only have one instance of this class
   * @returns The single class instance
   */
  static instance() : ToolManager {
    if (typeof this._instance === 'undefined') {
      this._instance = new ToolManager();
    }

    return this._instance;
  }

  registerTool(id : ToolID, tool : ITool) : void {
    if (typeof this._tools[id] === 'undefined') {
      this._tools[id] = tool;
    }
  }

  /**
   * Changes the active tool
   * @param toolId New tool's id
   */
  setActiveTool(toolId : ToolID) : void {
    if(this._activeToolId !== toolId) {
      this.cancelTool();

      this._activeToolId = toolId;
      this._tools[toolId].activate();
    }
  }

  /**
   * Cancels the active tool
   */
  cancelTool() : void {
    if (this._activeToolId !== null) {
      ui.tool?.cancel();
      this._activeToolId = null;
    }
  }

  /**
   * Exposes the tool size store for UI elements
   * @returns The tool size store
   */
  getToolSizeStore() : Store<number> {
    return this._toolSize;
  }

  /**
   * Gets the current tool size
   * @returns Current tool size
   */
  getToolSize() : number {
    return this._toolSize.get();
  }

  /**
   * Set the tool size
   * @param size New size, will be clamped to valid min-max range
   */
  setToolSize(size : number) : void {
    this._toolSize.set(Math.max(PluginConfig.minToolSize, Math.min(PluginConfig.maxToolSize, size)));
  }

  /**
   * Calculates the area around the tool that is affected by the tool
   * @param center Center point for the tool's usage
   * @returns MapRange for the affected area
   */
  getToolArea(center : CoordsXY) : MapRange {
    const halfSize : number = ((this._toolSize.get() - 1) / 2);

    const left : number = Math.floor((center.x / 32) - halfSize) * 32;
    const top : number = Math.floor((center.y / 32) - halfSize) * 32;
    const right : number = Math.floor((center.x / 32) + halfSize) * 32;
    const bottom  : number = Math.floor((center.y / 32) + halfSize) * 32;
  
    return MapRange(CoordsXY(left, top), CoordsXY(right, bottom));
  }

  /**
   * Stores the view rights button's current state so we can recall it when a tool ends
   */
  cacheViewRightsState() : boolean {
    const toolbarWindow : IWindow = UIManager.instance().getWindow(WindowID.TOOLBAR);
    const viewRightsButton : ToggleButton = toolbarWindow.getUIElement(ButtonID.VIEW_RIGHTS_BUTTON) as ToggleButton;
    this._viewRightsStateCache = viewRightsButton.isPressed();
    return this._viewRightsStateCache;
  }

  /**
   * Returns the view rights button's cached state
   */
  getCachedViewRightsState() : boolean {
    return this._viewRightsStateCache;
  }
}