/// <reference path='../../../lib/openrct2.d.ts' />

import { FlexiblePosition, ToggleParams, TwoWayBinding, WritableStore, isStore, isTwoWay, store, toggle, twoway } from 'openrct2-flexui';
import { ElementID } from '../types/enums';
import { StatefulButtonGroup } from './StatefulButtonGroup';
import { BaseElement } from './BaseElement';
import { FlexUIWidget } from '../types/types';





/**
 * Params for the toggle buttons with onChange set as required and omitting isPressed
 */
export type ToggleButtonParams = ToggleParams & FlexiblePosition;

type InternalParams = ToggleButtonParams & Required<Pick<ToggleButtonParams, 'onChange'>> & {
  isPressed : TwoWayBinding<boolean>
};

/**
 * A wrapping class for Toggle to keep things cleaner elsewhere
 */
export class ToggleButton extends BaseElement<InternalParams> {
  readonly buttonGroup? : StatefulButtonGroup;

  protected callback : undefined | ((isPressed : boolean) => void);

  constructor(id : ElementID, params : ToggleButtonParams, buttonGroup? : StatefulButtonGroup) {
    super(id, params as InternalParams);
    this.buttonGroup = buttonGroup;
  }

  /**
   * Builds the widget and returns it for initialization
   */
  protected _buildWidget() : FlexUIWidget {
    const params = this.params;

    if (typeof params.isPressed === 'undefined') {
      params.isPressed = twoway(store(false));
    } else if (typeof params.isPressed === 'boolean') {
      params.isPressed = twoway(store(params.isPressed));
    } else if (isStore(params.isPressed) && !isTwoWay(params.isPressed)) {
      params.isPressed = twoway(params.isPressed as WritableStore<boolean>);
    }
    
    this.callback = params.onChange;
    params.onChange = (isPressed : boolean) : void => this.onChange(isPressed);

    return toggle(params);
  }

  /**
   * @returns true if the button is pressed
   */
  isPressed() : boolean {
    return this.params.isPressed.twoway.get();
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

    this.buttonGroup?.depressOthers(this.id, triggerChange);
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
    
    this.params.isPressed.twoway.set(press);

    if (triggerChange) {
      this.onChange(press);
    }
  }

  /**
   * Handles button state changes
   * @param isPressed True if the button is considered pressed
   */
  onChange(isPressed? : boolean) : void {
    if (typeof isPressed === 'undefined') {
      isPressed = this.isPressed();
    }
    
    if (isPressed) {
      this.buttonGroup?.depressOthers(this.id, true);
    }

    if (typeof this.callback !== 'undefined') {
      this.callback(isPressed);
    }
  }
}