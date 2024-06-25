/// <reference path='../../lib/openrct2.d.ts' />

import { Manager } from '@src/Manager';
import { ToolID } from './types/enums';
import { ITool } from './tools/ITool';
import { WritableStore, store } from 'openrct2-flexui';
import { DataStore } from '@src/DataStore';
import { DataStoreManager } from '@src/DataStoreManager';
import { DataStoreID } from '@src/types/enums';
import { PluginData } from '@src/types/types';



class TilemanToolManager extends Manager<ToolID, ITool> {
  private _activeToolId : ToolID | null = null;
  private _toolSize! : WritableStore<number>;



  constructor() {
    super();
  }



  /**
   * **********
   * Data Handling
   * **********
   */
  
  /**
    * Exposes the tool size store for UI elements
    * @returns The tool size store
    */
  public getToolSizeStore() : WritableStore<number> {
    if (typeof this._toolSize === 'undefined') {
      this._toolSize = store<number>(DataStoreManager.getInstance(DataStoreID.PLUGIN).get('minToolSize'))
    }

    return this._toolSize;
  }

  /**
    * Gets the current tool size
    * @returns Current tool size
    */
  public getToolSize() : number {
    return this.getToolSizeStore().get();
  }

  /**
    * Set the tool size
    * @param size New size, will be clamped to valid min-max range
    */
  public setToolSize(size : number) : void {
    const Plugin : DataStore<PluginData> = DataStoreManager.getInstance(DataStoreID.PLUGIN);
    this.getToolSizeStore().set(Math.max(Plugin.get('minToolSize'), Math.min(Plugin.get('maxToolSize'), size)));
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