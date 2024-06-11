/// <reference path='../../../lib/openrct2.d.ts' />

import { Bindable, Colour, ElementParams, FlexiblePosition, WritableStore, isStore, read, widget } from "openrct2-flexui";
import { ElementID } from '../types/enums';
import { BaseElement } from './BaseElement';
import { FlexUIWidget } from '../types/types';





/**
 * Parameters to create a new ProgressBar
 */
export type ProgressBarParams = ElementParams  & FlexiblePosition & {
  background : Bindable<Colour>,
  foreground : Bindable<Colour>,
  percentFilled : Bindable<number>
};

/**
 * A wrapping class for Toggle to keep things cleaner elsewhere
 */
export class ProgressBar extends BaseElement<ProgressBarParams> {
  constructor(id : ElementID, params : ProgressBarParams) {
    super(id, params);
  }

  /**
   * Builds the widget and returns it for initialization
   */
  protected _buildWidget() : FlexUIWidget {
    return widget({
      type: 'custom',
      width: this.params.width ?? '1w',
      height: this.params.height ?? 10,
      onDraw: this._onDraw.bind(this),
    });
  }

  /**
   * Handles onDraw event
   * @param g GraphicsContext to draw with
   */
  private _onDraw(g : GraphicsContext) : void {
    g.colour = read(this.params.background);
    g.well(0, 0, g.width, g.height);
    g.colour = read(this.params.foreground);
    g.box(1, 1, g.width * read(this.params.percentFilled) - 2, g.height - 2);
  }

  /**
   * Sets the progress bar to a certain percent
   * @param percent Integer from 0-100
   */
  public set(percent : number) : void {
    if (isStore(this.params.percentFilled)) {
      (this.params.percentFilled as WritableStore<number>).set(percent);
    } else {
      this.params.percentFilled = percent;
    }
  }
}