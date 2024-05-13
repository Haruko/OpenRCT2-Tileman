/// <reference path='../lib/openrct2.d.ts' />

import { Bindable, Colour, ElementParams, FlexiblePosition, WidgetCreator, isStore, widget } from "openrct2-flexui";



/**
 * Progress Bar
 */

/**
 * Parameters to create a new ProgressBar
 */
interface ProgressBarParams extends ElementParams {
  background : Bindable<Colour>,
  foreground : Bindable<Colour>,
  percentFilled : Bindable<number>
}

/**
 * Creates a new ProgressBar
 * @param params Parameters defining ProgressBar customization
 * @returns ProgressBar WidgetCreator
 */
export function progressbar(params : ProgressBarParams & FlexiblePosition) : WidgetCreator<FlexiblePosition> {
  return widget({
    type: 'custom',
    width: params.width ?? '1w',
    height: params.height ?? 10,
    onDraw(g : GraphicsContext) {
      const background : Colour = isStore(params.background) ? params.background.get() : params.background;
      const foreground : Colour = isStore(params.foreground) ? params.foreground.get() : params.foreground;
      const percentFilled = isStore(params.percentFilled) ? params.percentFilled.get() : params.percentFilled;

      g.colour = background;
      g.well(0, 0, g.width, g.height);
      g.colour = foreground;
      g.box(1, 1, g.width * percentFilled - 2, g.height - 2);
    },
  });
}