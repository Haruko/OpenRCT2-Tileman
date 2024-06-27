/// <reference path='../../../../lib/openrct2.d.ts' />

import { FlexiblePosition, ToggleParams } from 'openrct2-flexui';
import { ToggleButton } from './ToggleButton';
import { ElementID } from '../types/enums';
import { StatefulButtonGroup } from './StatefulButtonGroup';
import { DataStoreID } from '@src/types/enums';
import { DataStoreManager } from '@src/DataStoreManager';





/**
 * Params for the toggle buttons with onChange set as required and omitting isPressed
 */
type DoubleClickButtonParams = ToggleParams & Omit<ToggleParams & FlexiblePosition, 'isPressed'>;

/**
 * A wrapping class for Toggle to keep things cleaner elsewhere
 */
export class DoubleClickButton extends ToggleButton {
  protected clickTimeout : number | undefined;

  constructor(id : ElementID, params : DoubleClickButtonParams, buttonGroup? : StatefulButtonGroup) {
    super(id, params, buttonGroup);
  }

  /**
   * Handles button state changes
   * @param isPressed True if the button is considered pressed
   */
  override onChange(isPressed? : boolean) : void {
    if (this.isPressed() && typeof this.clickTimeout === 'undefined') {
      const dsManager : DataStoreManager = DataStoreManager.instance();
      const doubleClickLength : number = dsManager.getInstance(DataStoreID.PLUGIN).get('doubleClickLength');

      this.clickTimeout = context.setTimeout(() => {
        if (typeof this.clickTimeout === 'number') {
          // Double click timed out
          context.clearTimeout(this.clickTimeout);
          this.clickTimeout = undefined;
          this.depress();
        }
      }, doubleClickLength);

      this.buttonGroup?.depressOthers(this.id);
    } else if (!this.isPressed() && typeof this.clickTimeout === 'number') {
      // Successful double click
      context.clearTimeout(this.clickTimeout);
      this.clickTimeout = undefined;

      // Always pass true since a double click determines that a button was clicked
      this.callback?.(true);
    }
  }

  /**
   * Cancels a double click
   */
  cancelDoubleClick() : void {
    if (typeof this.clickTimeout !== 'undefined') {
      context.clearTimeout(this.clickTimeout);
      this.clickTimeout = undefined;
      this.depress();
    }
  }
}