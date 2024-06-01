/// <reference path='../../../lib/openrct2.d.ts' />

import { FlexiblePosition, ToggleParams } from "openrct2-flexui";
import { ButtonID } from "@src/ui";
import { ToggleButton } from "@ui/elements/ToggleButton";
import { getPluginConfig } from "@src/data";
import { StatefulButtonGroup } from "@ui/elements/ToggleButtonGroup";

const PluginConfig = getPluginConfig();





/**
 * Params for the toggle buttons with onChange set as required and omitting isPressed
 */
type DoubleClickButtonParams = Required<Pick<ToggleParams, 'onChange'>>
                          & Omit<ToggleParams & FlexiblePosition, 'isPressed'>;

/**
 * A wrapping class for Toggle to keep things cleaner elsewhere
 */
export class DoubleClickButton extends ToggleButton {
  protected clickTimeout : number | undefined;

  constructor(buttonId : ButtonID, params : DoubleClickButtonParams, buttonGroup? : StatefulButtonGroup) {
    super(buttonId, params, buttonGroup);
  }

  /**
   * Handles button state changes
   * @param callback Callback function
   */
  override onChange(isPressed? : boolean) : void {
    if (this.isPressed() && typeof this.clickTimeout === 'undefined') {
      this.clickTimeout = context.setTimeout(() => {
        if (typeof this.clickTimeout === 'number') {
          // Double click timed out
          context.clearTimeout(this.clickTimeout);
          this.clickTimeout = undefined;
          this.depress();
        }
      }, PluginConfig.doubleClickLength);

      this.buttonGroup?.depressOthers(this.buttonId);
    } else if (!this.isPressed() && typeof this.clickTimeout === 'number') {
      // Successful double click
      context.clearTimeout(this.clickTimeout);
      this.clickTimeout = undefined;

      // Always pass true since a double click determines that a button was clicked
      this.callback(true);
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