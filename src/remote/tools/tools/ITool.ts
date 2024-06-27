/// <reference path='../../../../lib/openrct2.d.ts' />



export interface ITool {
  /**
   * Starts tool usage
   */
  activate() : void;

  /**
   * Cancels tool usage
   */
  cancel() : void;
};