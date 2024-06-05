/// <reference path='../../lib/openrct2.d.ts' />

import { ViewportFlags } from 'openrct2-flexui';
import { ElementID, WindowID } from './types/enums';
import { IWindow } from './windows/IWindow';
import { Manager } from '@src/Manager';
import { ToggleButton } from './elements/ToggleButton';





class TilemanUIManager extends Manager<WindowID, IWindow> {
  private _cachedRightsVisibility : boolean = false;

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
  }

  public cacheRightsVisibility() : void {
    const toolbarWindow : IWindow = UIManager.getInstance(WindowID.TOOLBAR);
    const viewRightsButton : ToggleButton = toolbarWindow.getChildElement(ElementID.VIEW_RIGHTS_BUTTON) as ToggleButton;
    this._cachedRightsVisibility = viewRightsButton.isPressed();
  }

  /**
   * Restores the rights visibility to what was last cached
   */
  public restoreRightsVisibility() : void {
    this.setRightsVisibility(this._cachedRightsVisibility);
  }
};

export const UIManager : TilemanUIManager = new TilemanUIManager();