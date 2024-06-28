/// <reference path='../../lib/openrct2.d.ts' />

import { ToolManager } from './ToolManager';
import { BuyTool } from './tools/BuyTool';
import { RightsTool } from './tools/RightsTool';
import { SellTool } from './tools/SellTool';
import { ToolID } from './types/enums';



export function initializeTools() : void {
  const toolManager : ToolManager = ToolManager.instance();
  toolManager.registerInstance(ToolID.BUY, BuyTool.instance());
  toolManager.registerInstance(ToolID.RIGHTS, RightsTool.instance());
  toolManager.registerInstance(ToolID.SELL, SellTool.instance());
}