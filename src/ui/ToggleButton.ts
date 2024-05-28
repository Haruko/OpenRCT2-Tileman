/// <reference path='../../lib/openrct2.d.ts' />

import { FlexiblePosition, ToggleParams, WritableStore, store, toggle } from "openrct2-flexui";
import { ButtonID, FlexUIWidget } from "../ui";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

/**
 * Params for the toggle buttons with onChange set as required and omitting isPressed
 */
type ToggleButtonParams = Required<Pick<ToggleParams, 'onChange'>>
                          & Omit<ToggleParams & FlexiblePosition, 'isPressed'>;

/**
 * A wrapping class for Toggle to keep things cleaner elsewhere
 */
export class ToggleButton {
  readonly buttonId : ButtonID;
  readonly buttonGroup? : ToggleButtonGroup;
  readonly widget : FlexUIWidget;

  readonly isPressedStore : WritableStore<boolean> = store<boolean>(false);

  constructor(buttonId : ButtonID, params : ToggleButtonParams, buttonGroup? : ToggleButtonGroup) {
    this.buttonId = buttonId;
    this.buttonGroup = buttonGroup;

    const buttonParams : ToggleParams & FlexiblePosition = params;
    buttonParams.isPressed = { twoway: this.isPressedStore };

    // Do it like this to prevent infinite loop and use Store.subscribe to avoid double triggering on user clicks
    const callback = params.onChange; // params because never undefined
    delete buttonParams.onChange; // buttonParams so we can make it undefined
    this.isPressedStore.subscribe((isPressed : boolean) : void => this.onChange(callback));

    this.widget = toggle(buttonParams);
  }

  /**
   * @returns true if the button is pressed
   */
  isPressed() : boolean {
    return this.isPressedStore.get();
  }

  /**
   * Presses the button
   */
  press() : void {
    // Only follow through if it's a state change
    if (this.isPressed()) {
      return;
    }

    if (typeof this.buttonGroup !== 'undefined') {
      this.buttonGroup.depressOthers(this.buttonId);
    }

    this.isPressedStore.set(true);
  }

  /**
   * Depresses the button
   */
  depress() : void {
    // Only follow through if it's a state change
    if (!this.isPressed()) {
      return;
    }
    
    this.isPressedStore.set(false);
  }

  /**
   * Toggles the button
   * @returns final state of the button
   */
  toggle() : boolean {
    if (this.isPressed()) {
      this.depress();
      return false;
    } else {
      this.press();
      return true;
    }
  }

  /**
   * Handles button state changes
   * @param callback Callback function
   */
  onChange(callback : Function) : void {
    if (this.isPressed() && typeof this.buttonGroup !== 'undefined') {
      this.buttonGroup.depressOthers(this.buttonId);
    }

    callback(this.isPressed());
  }
}