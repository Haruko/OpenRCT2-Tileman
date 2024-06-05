/// <reference path='../../lib/openrct2.d.ts' />

import { ToolManager } from './ToolManager';
import { BuyTool } from './tools/BuyTool';
import { RightsTool } from './tools/RightsTool';
import { SellTool } from './tools/SellTool';
import { ToolID } from './types/enums';

export function initializeTools() : void {
  ToolManager.registerInstance(ToolID.BUY, BuyTool);
  ToolManager.registerInstance(ToolID.RIGHTS, RightsTool);
  ToolManager.registerInstance(ToolID.SELL, SellTool);
}