/// <reference path='../../../lib/openrct2.d.ts' />

import { ElementID } from '@src/ui/types/enums';
import { BaseTool } from './BaseTool';
import { ToolID } from '../types/enums';
import { Park } from '@src/Park';

class TilemanSellTool extends BaseTool {
  constructor() {
    super(ToolID.BUY, ElementID.SELL_TOOL);
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
  protected applyTool = (area : MapRange) => Park.rangeSell(area);
}

export const SellTool : TilemanSellTool = new TilemanSellTool();