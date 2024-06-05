/// <reference path='../../lib/openrct2.d.ts' />

import { Manager } from '@src/Manager';
import { ToolID } from './types/enums';
import { ITool } from './ITool';
import { WritableStore, store } from 'openrct2-flexui';
import { Plugin } from '@src/Plugin';



class TilemanToolManager extends Manager<ToolID, ITool> {
  private _activeToolId : ToolID | null = null;
  private readonly _toolSize : WritableStore<number> = store<number>(Plugin.get('minToolSize'));

  /**
   * Changes active tool
   * @param toolId New active tool
   */
  setActiveTool(toolId : ToolID) : void {
    if(this._activeToolId !== toolId) {
      this.cancelTool();

      this._activeToolId = toolId;
      this.getInstance(toolId).activate();
    }
  }

  /**
   * Cancels the currently active tool
   */
  cancelTool() : void {
    if (this._activeToolId !== null) {
      this.getInstance(this._activeToolId).cancel();
      this._activeToolId = null;
    }
  }


}

export const ToolManager : TilemanToolManager = new TilemanToolManager();