/// <reference path='../../../lib/openrct2.d.ts' />

import { FlexiblePosition, ToggleParams, WritableStore, store, toggle } from 'openrct2-flexui';
import { ElementID } from '../types/enums';
import { StatefulButtonGroup } from './StatefulButtonGroup';
import { FlexUIWidget } from '@src/flexui-extension/types/FlexUIWidget';





/**
 * Params for the toggle buttons with onChange set as required and omitting isPressed
 */
type ToggleButtonParams = Required<Pick<ToggleParams, 'onChange'>>
                          & Omit<ToggleParams & FlexiblePosition, 'isPressed'>;

/**
 * A wrapping class for Toggle to keep things cleaner elsewhere
 */
export class ToggleButton {
  readonly buttonId : ElementID;
  readonly buttonGroup? : StatefulButtonGroup;
  readonly widget : FlexUIWidget;

  protected readonly callback : (isPressed : boolean) => void;
  protected readonly isPressedStore : WritableStore<boolean> = store<boolean>(false);

  constructor(buttonId : ElementID, params : ToggleButtonParams, buttonGroup? : StatefulButtonGroup) {
    this.buttonId = buttonId;
    this.buttonGroup = buttonGroup;

    const buttonParams : ToggleParams & FlexiblePosition = params;
    buttonParams.isPressed = { twoway: this.isPressedStore };
    
    this.callback = params.onChange; // params because never undefined
    params.onChange = (isPressed : boolean) : void => this.onChange(isPressed);

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
   * @param triggerChange true if we should simulate an onChange event trigger
   */
  press(triggerChange? : boolean) : void {
    // Only follow through if it's a state change
    if (this.isPressed()) {
      return;
    }

    this.buttonGroup?.depressOthers(this.buttonId, triggerChange);
    this.set(true, triggerChange);
  }

  /**
   * Depresses the button
   * @param triggerChange true if we should simulate an onChange event trigger
   */
  depress(triggerChange? : boolean) : void {
    // Only follow through if it's a state change
    if (!this.isPressed()) {
      return;
    }

    this.set(false, triggerChange);
  }

  /**
   * Toggles the button
   * @param triggerChange true if we should simulate an onChange event trigger
   * @returns final state of the button
   */
  toggle(triggerChange? : boolean) : boolean {
    this.set(!this.isPressed(), triggerChange);
    return this.isPressed();
  }

  /**
   * Sets the button state explicitly
   * @param pressed state to set button
   * @param triggerChange true if we should simulate an onChange event trigger
   */
  set(press : boolean, triggerChange? : boolean) : void {
    // Only follow through if it's a state change
    if (this.isPressed() === press) {
      return;
    }
    
    this.isPressedStore.set(press);

    if (triggerChange) {
      this.onChange(press);
    }
  }

  /**
   * Handles button state changes
   * @param callback Callback function
   */
  onChange(isPressed? : boolean) : void {
    if (typeof isPressed === 'undefined') {
      isPressed = this.isPressed();
    }
    
    if (isPressed) {
      this.buttonGroup?.depressOthers(this.buttonId, true);
    }

    this.callback(isPressed);
  }
}