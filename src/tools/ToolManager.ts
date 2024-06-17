/// <reference path='../../lib/openrct2.d.ts' />

import { Manager } from '@src/Manager';
import { ToolID } from './types/enums';
import { ITool } from './tools/ITool';
import { Store, WritableStore, store } from 'openrct2-flexui';
import { Plugin } from '@src/Plugin';



class TilemanToolManager extends Manager<ToolID, ITool> {
  public _activeToolId : ToolID | null = null;
  private readonly _toolSize : WritableStore<number> = store<number>(Plugin.get('minToolSize'));



  /**
   * **********
   * Data Handling
   * **********
   */
  
  /**
    * Exposes the tool size store for UI elements
    * @returns The tool size store
    */
  public getToolSizeStore() : Store<number> {
    return this._toolSize;
  }

  /**
    * Gets the current tool size
    * @returns Current tool size
    */
  public getToolSize() : number {
    return this._toolSize.get();
  }

  /**
    * Set the tool size
    * @param size New size, will be clamped to valid min-max range
    */
  public setToolSize(size : number) : void {
    this._toolSize.set(Math.max(Plugin.get('minToolSize'), Math.min(Plugin.get('maxToolSize'), size)));
  }



  /**
   * **********
   * State Handling
   * **********
   */

  /**
   * Changes active tool
   * @param toolId New active tool
   */
  public setActiveTool(toolId : ToolID) : void {
    if(this._activeToolId !== null && this._activeToolId !== toolId) {
      this.cancelTool();
    }

    this._activeToolId = toolId;
    this.getInstance(toolId).activate();
  }

  /**
   * Cancels active tool
   */
  public cancelTool() : void {
    if (this._activeToolId !== null) {
      this.getInstance(this._activeToolId).cancel();
      this._activeToolId = null;
    }
  }
}

export const ToolManager : TilemanToolManager = new TilemanToolManager();