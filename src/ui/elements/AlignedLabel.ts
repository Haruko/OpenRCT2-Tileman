/// <reference path='../../../lib/openrct2.d.ts' />

import { Bindable, Colour, FlexiblePosition, LabelParams, read, widget } from 'openrct2-flexui';
import { BaseElement } from './BaseElement';
import { ElementID } from '../types/enums';
import { FlexUIWidget, HorizontalAlignment, VerticalAlignment } from '../types/types';

export type AlignedLabelParams = FlexiblePosition & Omit<LabelParams, 'alignment'> & {
  textAlignment? : {
    horizontal?: Bindable<HorizontalAlignment>
    vertical?: Bindable<VerticalAlignment>
  }
};

/**
 * A wrapping class for Label to add right alignment
 */
export class AlignedLabel extends BaseElement<AlignedLabelParams> {
  constructor(id : ElementID, params : AlignedLabelParams) {
    super(id, params as AlignedLabelParams);
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
      tooltip: this.params.tooltip,
      disabled: this.params.disabled,
      visibility: this.params.visibility,
      width: this.params.width,
      height: this.params.height ?? 14,
      padding: this.params.padding,
      onDraw: this._onDraw.bind(this),
    });
  }

  /**
   * Handles onDraw event
   * @param g GraphicsContext to draw with
   */
  private _onDraw(g : GraphicsContext) : void {
    // Text
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

    g.colour = Colour.White;
    g.text(text, x, y);
  }
}