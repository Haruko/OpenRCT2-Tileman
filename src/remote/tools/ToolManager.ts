/// <reference path='../../../lib/openrct2.d.ts' />

import { Manager } from '@src/Manager';
import { ToolID } from './types/enums';
import { ITool } from './tools/ITool';
import { WritableStore, store } from 'openrct2-flexui';
import { DataStore } from '@src/DataStore';
import { DataStoreID } from '@src/types/enums';
import { PluginData } from '@src/types/types';
import { DataStoreManager } from '@src/DataStoreManager';



export class ToolManager extends Manager<ToolID, ITool> {
  private _activeToolId : ToolID | null = null;
  private _toolSize! : WritableStore<number>;



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
      const dsManager : DataStoreManager = DataStoreManager.instance();
      this._toolSize = store<number>(dsManager.getInstance(DataStoreID.PLUGIN).get('minToolSize'))
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
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    this.getToolSizeStore().set(Math.max(plugin.get('minToolSize'), Math.min(plugin.get('maxToolSize'), size)));
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