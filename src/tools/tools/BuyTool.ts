/// <reference path='../../../lib/openrct2.d.ts' />

import { ElementID } from '@src/ui/types/enums';
import { BaseTool } from '../BaseTool';
import { ToolID } from '../types/enums';

class TilemanBuyTool extends BaseTool {
  constructor() {
    super(ToolID.BUY, ElementID.BUY_TOOL);
  }
}

export const BuyTool : TilemanBuyTool = new TilemanBuyTool();