/// <reference path='../../../lib/openrct2.d.ts' />

import { ViewportFlags } from 'openrct2-flexui';
import { ElementID, WindowID } from './types/enums';
import { IWindow } from './windows/IWindow';
import { Manager } from '@src/Manager';
import { ToggleButton } from './elements/ToggleButton';
import { isMapRange } from '@src/types/MapRange';



export class UIManager extends Manager<WindowID, IWindow> {
  private _cachedRightsVisibility : boolean = false;



  /**
   * **********
   * Construction Rights Visibility
   * **********
   */
  
  /**
   * Toggles the visibility of owned construction rights
   * @param visible true if we are setting the rights visible
   */
  public setRightsVisibility(visible : boolean) : void {
    if (visible) {
      ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags | ViewportFlags.ConstructionRights;
    } else {
      ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags & ~ViewportFlags.ConstructionRights;
    }

    const uiManager : UIManager = UIManager.instance();
    const toolbarWindow : IWindow = uiManager.getInstance(WindowID.TOOLBAR);
    const viewRightsButton : ToggleButton = toolbarWindow.getChildElement(ElementID.VIEW_RIGHTS_BUTTON) as ToggleButton;
    viewRightsButton.set(visible, true);
  }

  public cacheRightsVisibility() : void {
    const uiManager : UIManager = UIManager.instance();
    const toolbarWindow : IWindow = uiManager.getInstance(WindowID.TOOLBAR);
    const viewRightsButton : ToggleButton = toolbarWindow.getChildElement(ElementID.VIEW_RIGHTS_BUTTON) as ToggleButton;
    this._cachedRightsVisibility = viewRightsButton.isPressed();
  }

  /**
   * Restores the rights visibility to what was last cached
   */
  public restoreRightsVisibility() : void {
    this.setRightsVisibility(this._cachedRightsVisibility);
  }



  /**
   * **********
   * Selection Area
   * **********
   */

  /**
   * Sets the selection grid
   * @param areaOrArray Area or array of CoordsXY to select
   */
  public setSelectionArea(areaOrArray : MapRange | CoordsXY[]) : void {
    if (isMapRange(areaOrArray)) {
      // Set one
      ui.tileSelection.range = areaOrArray;

      // Clear the other
      ui.tileSelection.tiles = [];
    } else {
      // Set one
      ui.tileSelection.tiles = areaOrArray;

      // Clear the other
      ui.tileSelection.range = null;
    }
  }

  /**
   * Clears the selection grid
   */
  public clearSelectionArea() : void {
    ui.tileSelection.range = null;
    ui.tileSelection.tiles = [];
  }
};