/// <reference path='../../lib/openrct2.d.ts' />

import { ToggleButton } from '@ui/elements/ToggleButton';
import { ButtonID } from '@ui/windows/TilemanWindow';
import { IWindow } from '@ui/windows/IWindow';
import { UIManager, WindowID } from '@ui/windows/UIManager';
import { ToolManager } from './ToolManager';





export enum ToolID {
  BUY = 'Tileman-BuyTool',
  RIGHTS = 'Tileman-RightsTool',
  SELL = 'Tileman-SellTool'
};



export interface Tool {
  /**
   * Starts tool usage
   */
  activate() : void;

  /**
   * Cancels tool usage
   */
  cancel() : void;
};



export abstract class BaseTilemanTool implements Tool {
  private _id : ToolID;
  private _buttonId : ButtonID;
  private _isActive : boolean = false;

  constructor(id : ToolID, buttonId : ButtonID) {
    this._id = id;
    this._buttonId = buttonId;
  }

  /**
   * Starts tool usage
   */
  activate() : ToolID {
    if (!this._isActive) {
      ui.activateTool({
        id: this._id,
        cursor: 'dig_down',
        filter: ['terrain', 'water'],
  
        onStart: () => this._onToolStart(),
        onDown: (e : ToolEventArgs) => this._onToolDown(e),
        onMove: (e : ToolEventArgs) => this._onToolMove(e),
        onUp: (e : ToolEventArgs) => this._onToolUp(e),
        onFinish: () => this._onToolFinish()
      });

      this._isActive = true;
    }

    return this._id;
  }

  /**
   * Cancels tool usage
   */
  cancel() : void {
    if(this._isActive) {
      ui.tool?.cancel();
      this._isActive = false;
    }
  }

  /**
   * Handles onStart
   */
  protected _onToolStart() : void {
    ToolManager.instance().cacheViewRightsState();
    // setRightsVisibility(true);
  }

  /**
   * Handles onDown
   */
  protected _onToolDown(e : ToolEventArgs) : void {
    //TODO
  }

  /**
   * Handles onMove
   */
  protected _onToolMove(e : ToolEventArgs) : void {
    //TODO
  }

  /**
   * Handles onUp
   */
  protected _onToolUp(e : ToolEventArgs) : void {
    //TODO: Why????
    // ui.tileSelection.range = null;
  }

  /**
   * Handles onFinish
   */
  protected _onToolFinish() : void {
    const toolbarWindow : IWindow = UIManager.instance().getWindow(WindowID.TOOLBAR);
    const button : ToggleButton = toolbarWindow.getUIElement(this._buttonId) as ToggleButton;
    button.depress();

    // Don't clear last view rights button state in case the next tool runs onStart before this finishes
    // setRightsVisibility(toolManager.getCachedViewRightsState());
    ui.tileSelection.range = null;
  }
};

export class TempTilemanTool extends BaseTilemanTool {

  /**
   * Handles onDown
   */
  protected override _onToolDown(e : ToolEventArgs) : void {
    super._onToolDown(e);
    //TODO
  }

  /**
   * Handles onMove
   */
  protected override _onToolMove(e : ToolEventArgs) : void {
    super._onToolMove(e);
    //TODO
  }

  /**
   * Handles onUp
   */
  protected override _onToolUp(e : ToolEventArgs) : void {
    super._onToolUp(e);
    //TODO
  }

  /**
   * Handles onFinish
   */
  protected override _onToolFinish() : void {
    super._onToolFinish();
    //TODO
  }
};