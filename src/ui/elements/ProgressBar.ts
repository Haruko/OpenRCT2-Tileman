/// <reference path='../../../lib/openrct2.d.ts' />

import { Bindable, Colour, ElementParams, FlexiblePosition, WritableStore, isStore, read, widget } from "openrct2-flexui";
import { ElementID } from '../types/enums';
import { BaseElement } from './BaseElement';
import { FlexUIWidget, HorizontalAlignment, VerticalAlignment } from '../types/types';





/**
 * Parameters to create a new ProgressBar
 */
export type ProgressBarParams = ElementParams & FlexiblePosition & {
  background : Bindable<Colour>,
  foreground : Bindable<Colour>,
  text? : Bindable<string>,
  textAlignment? : {
    horizontal?: Bindable<HorizontalAlignment>,
    vertical?: Bindable<VerticalAlignment>
  }
  percentFilled : Bindable<number>
};

type InternalType = ProgressBarParams & Required<Pick<ProgressBarParams, 'text'>>;

/**
 * A wrapping class for Toggle to keep things cleaner elsewhere
 */
export class ProgressBar extends BaseElement<InternalType> {
  constructor(id : ElementID, params : ProgressBarParams) {
    super(id, params as InternalType);
  }

  /**
   * Builds the widget and returns it for initialization
   */
  protected _buildWidget() : FlexUIWidget {
    if (typeof this.params.text === 'undefined') {
      this.params.text = '';
    }

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
    // Background well
    g.colour = read(this.params.background);
    g.well(0, 0, g.width, g.height);

    // Foreground bar
    const percent : number = read(this.params.percentFilled);
    if (percent > 0) {
      g.colour = read(this.params.foreground);
      g.box(1, 1, g.width * read(this.params.percentFilled) - 2, g.height - 2);
    }

    // Text
    g.colour = Colour.White;
    const text = read(this.params.text);
    const textSize : ScreenSize = g.measureText(text);

    let x : number;
    switch (read(this.params.textAlignment?.horizontal)) {
      case 'left': {
        x = 0;
        break;
      } case 'center': {
        x = (g.width / 2) - (textSize.width / 2);
        break;
      } case 'right': {
        x = g.width - textSize.width;
        break;
      } default: {
        // Default to left
        x = 0;
        break;
      }
    }

    let y : number;
    switch (read(this.params.textAlignment?.vertical)) {
      case 'top': {
        y = 0;
        break;
      } case 'center': {
        y = (g.height / 2) - (textSize.height / 2);
        break;
      } case 'bottom': {
        y = g.height - textSize.height;
        break;
      } default: {
        // Default to center
        y = (g.height / 2) - (textSize.height / 2);
        break;
      }
    }

    g.text(text, x, y);
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