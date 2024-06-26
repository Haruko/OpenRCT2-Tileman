/// <reference path='../../../lib/openrct2.d.ts' />

import { ElementID, WindowID } from '@src/ui/types/enums';
import { ITool } from './ITool';
import { ToolID } from '../types/enums';
import { IWindow } from '@src/ui/windows/IWindow';
import { UIManager } from '@src/ui/UIManager';
import { ToggleButton } from '@src/ui/elements/ToggleButton';
import { CoordsXY } from '@src/types/CoordsXY';
import { ToolManager } from '../ToolManager';
import { MapRange } from '@src/types/MapRange';
import { Singleton } from '@src/Singleton';



export abstract class BaseTool extends Singleton implements ITool {
  private _id : ToolID;
  private _buttonId : ElementID;
  private _isActive : boolean = false;

  private _coordsLastUsed : CoordsXY = CoordsXY(0, 0);

  protected constructor(id : ToolID, buttonId : ElementID) {
    super();
    
    this._id = id;
    this._buttonId = buttonId;
  }



  /**
   * **********
   * State Handling
   * **********
   */

  /**
   * Starts tool usage
   */
  public activate() : void {
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
  }

  /**
   * Cancels tool usage
   */
  public cancel() : void {
    if (ui.tool && ui.tool.id === this._id) {
      ui.tool.cancel();
    }

    this._isActive = false;
  }


  
  /**
   * **********
   * Event Handling
   * **********
   */

  /**
   * Handles onStart
   */
  protected _onToolStart() : void {
    const uiManager : UIManager = UIManager.instance();
    uiManager.cacheRightsVisibility();
    uiManager.setRightsVisibility(true);

    this._isActive = true;
  }

  /**
   * Handles onDown
   */
  protected _onToolDown(e : ToolEventArgs) : void {
    if (e.mapCoords?.x ?? 0 > 0) {
      const coords : CoordsXY = e.mapCoords as CoordsXY;
      const area = this.getToolArea(coords);

      // Use tool
      this.applyTool(area);

      // Update the cached coords
      this._coordsLastUsed = coords;
    } else {
      // Clear the cached coords
      this._coordsLastUsed = CoordsXY(0, 0);
    }
  }

  /**
   * Handles onMove
   */
  protected _onToolMove(e : ToolEventArgs) : void {
    if (e.mapCoords?.x ?? 0 > 0) {
      const coords : CoordsXY = e.mapCoords as CoordsXY;
      const area = this.getToolArea(coords);

      // Set the selection grid
      const uiManager : UIManager = UIManager.instance();
      uiManager.setSelectionArea(area);
  
      if (e.isDown && (coords.x !== this._coordsLastUsed.x || coords.y !== this._coordsLastUsed.y)) {
        const area = this.getToolArea(coords);

        // Use tool
        this.applyTool(area);

        // Update the cached coords
        this._coordsLastUsed = coords;
      }
    } else {
      // Clear the selection grid
      const uiManager : UIManager = UIManager.instance();
      uiManager.clearSelectionArea();

      // Clear the cached coords
      this._coordsLastUsed = CoordsXY(0, 0);
    }
  }

  /**
   * Handles onUp
   */
  protected _onToolUp(e : ToolEventArgs) : void {
    
  }

  /**
   * Handles onFinish
   */
  protected _onToolFinish() : void {
    // Depress the tool's button
    const uiManager : UIManager = UIManager.instance();
    const toolbarWindow : IWindow = uiManager.getInstance(WindowID.TOOLBAR);
    const button : ToggleButton = toolbarWindow.getChildElement(this._buttonId) as ToggleButton;
    button.depress();

    // Restore view rights button to previous state
    uiManager.restoreRightsVisibility()

    // Clear the selection grid
    uiManager.clearSelectionArea();

    const toolManager : ToolManager = ToolManager.instance();
    toolManager.cancelTool();
  }


  
  /**
   * **********
   * Area Effects
   * **********
   */
  
  /**
   * Calculates the area around the tool that is affected by the tool
   * @param center Center point for the tool's usage
   * @returns MapRange for the affected area
   */
  protected getToolArea(center : CoordsXY) : MapRange {
    const toolManager : ToolManager = ToolManager.instance();
    const halfSize : number = ((toolManager.getToolSize() - 1) / 2);

    const left : number = Math.floor((center.x / 32) - halfSize) * 32;
    const top : number = Math.floor((center.y / 32) - halfSize) * 32;
    const right : number = Math.floor((center.x / 32) + halfSize) * 32;
    const bottom  : number = Math.floor((center.y / 32) + halfSize) * 32;
  
    return MapRange(CoordsXY(left, top), CoordsXY(right, bottom));
  }

  /**
   * Applies the current tool to an area
   * @param area Area to apply the tool to
   */
  protected abstract applyTool(area : MapRange) : void;
};