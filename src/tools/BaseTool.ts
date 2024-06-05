/// <reference path='../../lib/openrct2.d.ts' />

import { ElementID, WindowID } from '@src/ui/types/enums';
import { ITool } from './ITool';
import { ToolID } from './types/enums';
import { IWindow } from '@src/ui/windows/IWindow';
import { UIManager } from '@src/ui/UIManager';
import { ToggleButton } from '@src/ui/elements/ToggleButton';



export abstract class BaseTool implements ITool {
  private _id : ToolID;
  private _buttonId : ElementID;
  private _isActive : boolean = false;

  constructor(id : ToolID, buttonId : ElementID) {
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
      ui.tool!.cancel();
      this._isActive = false;
    }
  }

  /**
   * Handles onStart
   */
  protected _onToolStart() : void {
    console.log('super _onToolStart');

    UIManager.cacheRightsVisibility();
    UIManager.setRightsVisibility(true);
  }

  /**
   * Handles onDown
   */
  protected _onToolDown(e : ToolEventArgs) : void {
    console.log('super _onToolDown');
  }

  /**
   * Handles onMove
   */
  protected _onToolMove(e : ToolEventArgs) : void {
    console.log('super _onToolMove');
  }

  /**
   * Handles onUp
   */
  protected _onToolUp(e : ToolEventArgs) : void {
    console.log('super _onToolUp');
  }

  /**
   * Handles onFinish
   */
  protected _onToolFinish() : void {
    console.log('super _onToolFinish');

    const toolbarWindow : IWindow = UIManager.getInstance(WindowID.TOOLBAR);
    if (typeof toolbarWindow !== 'undefined') {
      const button : ToggleButton = toolbarWindow.getChildElement(this._buttonId) as ToggleButton;
      button.depress();
    }

    UIManager.restoreRightsVisibility()
    ui.tileSelection.range = null;
  }
};