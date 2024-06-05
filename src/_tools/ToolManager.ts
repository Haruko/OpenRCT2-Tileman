/// <reference path='../../lib/openrct2.d.ts' />

export class ToolManager {


  registerTool(id : ToolID, tool : ITool) : void {
    if (typeof this._tools[id] === 'undefined') {
      this._tools[id] = tool;
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
}