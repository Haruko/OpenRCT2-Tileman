/// <reference path='../../../lib/openrct2.d.ts' />

export enum ToolID {
  BUY = 'buy',
  RIGHTS = 'rights',
  SELL = 'sell'
};

/**
 * What action a tool is trying to do
 */
export enum LandOwnershipAction {
  SELL,
  BUY,
  RIGHTS
};