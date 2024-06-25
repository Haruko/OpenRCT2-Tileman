/// <reference path='../../../lib/openrct2.d.ts' />

import { ElementID } from '@src/ui/types/enums';
import { BaseTool } from './BaseTool';
import { ToolID } from '../types/enums';
import { Park } from '@src/Park';

class TilemanRightsTool extends BaseTool {
  constructor() {
    super(ToolID.BUY, ElementID.RIGHTS_TOOL);
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
  protected applyTool = (area : MapRange) => Park.rangeBuyRights(area);
}

export const RightsTool : TilemanRightsTool = new TilemanRightsTool();