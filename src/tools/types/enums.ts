/// <reference path='../../../lib/openrct2.d.ts' />

export enum ToolID {
  BUY = 'Tileman-BuyTool',
  RIGHTS = 'Tileman-RightsTool',
  SELL = 'Tileman-SellTool'
};

/**
 * What action a tool is trying to do
 */
export enum LandOwnershipAction {
  SELL,
  BUY,
  RIGHTS
};