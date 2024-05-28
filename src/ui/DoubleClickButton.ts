/// <reference path='../../lib/openrct2.d.ts' />

import { FlexiblePosition, ToggleParams } from "openrct2-flexui";
import { ButtonID } from "../ui";
import { ToggleButton } from "./ToggleButton";
import { getPluginConfig } from "../data";

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
  // readonly buttonId : ButtonID;
  // readonly buttonGroup? : ToggleButtonGroup;
  // readonly widget : FlexUIWidget;

  // protected isPressedStore : WritableStore<boolean> = store<boolean>(false);

  protected clickTimeout : number | undefined;

  constructor(buttonId : ButtonID, params : DoubleClickButtonParams) {
    super(buttonId, params);
  }

  /**
   * Handles button state changes
   * @param callback Callback function
   */
  override onChange(callback : Function) : void {
    if (this.isPressed() && typeof this.clickTimeout === 'undefined') {
      this.clickTimeout = context.setTimeout(() => {
        if (typeof this.clickTimeout === 'number') {
          // Double click timed out
          context.clearTimeout(this.clickTimeout);
          this.clickTimeout = undefined;
          this.depress();
        }
      }, PluginConfig.doubleClickLength);
    } else if (typeof this.clickTimeout === 'number') {
      // Successful double click
      context.clearTimeout(this.clickTimeout);
      this.clickTimeout = undefined;

      // Always pass true since a double click determines that a button was clicked
      callback(true);
    }
  }
}