/// <reference path='../../../lib/openrct2.d.ts' />

import { ElementID } from '@src/ui/types/enums';
import { BaseTool } from './BaseTool';
import { ToolID } from '../types/enums';
import { Map } from '@src/Map';

class TilemanBuyTool extends BaseTool {
  constructor() {
    super(ToolID.BUY, ElementID.BUY_TOOL);
  }


  
  /**
   * **********
   * Area Effects
   * **********
   */

  /**
   * Applies the current tool to an area
   * @param area Area to apply the tool to
   */
  protected applyTool = (area : MapRange) => Map.rangeBuy(area);
}

export const BuyTool : TilemanBuyTool = new TilemanBuyTool();