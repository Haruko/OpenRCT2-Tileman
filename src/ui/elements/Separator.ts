/// <reference path='../../../lib/openrct2.d.ts' />

import { Colour, FlexiblePosition, LabelParams, widget } from 'openrct2-flexui';
import { BaseElement } from './BaseElement';
import { ElementID } from '../types/enums';
import { FlexUIWidget, HorizontalAlignment, VerticalAlignment } from '../types/types';

export type SeparatorStyle = 'solid' | 'dashed' | 'invisible';
export type LineStyle = 'outset' | 'inset' | 'flat';

export type SeparatorParams = FlexiblePosition & Omit<LabelParams, 'alignment' | 'text' | 'tooltip' | 'colour'> & {
  // If multiple alignments are given, that's how many columns (horizontal) or rows (vertical) there are. Duplicates are ignored.
  alignment? : {
    // Defaults to 'center'
    horizontal? : HorizontalAlignment | HorizontalAlignment[] | 'all',
    // Defaults to 'center'
    vertical? : VerticalAlignment | VerticalAlignment[] | 'all',
  },
  
  // Per horizontal group. Defaults to 'solid'
  separatorStyle? : SeparatorStyle | SeparatorStyle[],

  // Per horizontal group. Defaults to 'outset'
  lineStyle? : LineStyle | LineStyle[],

  /**
   * Line color. Doesn't work well for 'flat' LineStyle. Defaults to white.
   * 
   * Color mappings for 'flat' style (ranges go dark-light):
   *       9 = Black
   *  10- 20 = Grey
   *      21 = "White"
   *     255 - WHITE
   * 
   * 166-177 = Red
   * 178-189 = Orange
   *  34- 45 = Tan
   *  46- 57 = Yellow
   *  22- 33 = Olive Green
   *  82- 93 = Tannish Olive Green
   *  70- 81 = Yellow Green
   *  94-105 = Green
   * 142-153 = Forest Green
   * 190-201 = Teal
   * 130-141 = Blue
   * 118-129 = Indigo
   * 154-165 = Purple
   * 202-213 = Magenta
   *  58- 69 = Rose Red
   * 106-117 = Salmon
   * 214-225 = Brown
   * 
   * Or just look at this https://docs.google.com/spreadsheets/d/1OtTAytgtecqW7bbN8K6lb6dw4LYUMiXXBb7ZLGyk__U
   */
  lineColour? : number | number[],
  // How long the overall line is
  lineLength? : number,
  // How thick the lines are
  lineThickness? : number,
  // How long each dash is
  dashLength? : number,
  // Spacing between each dash
  dashSpacing? : number,
};

/**
 * A wrapping class for Label to add right alignment
 */
export class Separator extends BaseElement<SeparatorParams> {
  private horizontalAlignment! : HorizontalAlignment[];
  private verticalAlignment! : VerticalAlignment[];

  private separatorStyle! : SeparatorStyle[];

  private lineStyle! : LineStyle[];
  private lineColour! : number[];
  private lineLength! : number;
  private lineThickness! : number;

  private dashLength! : number;
  private dashSpacing! : number;

  constructor(params : SeparatorParams) {
    super(ElementID.NONE, params as SeparatorParams);
  }

  /**
   * Builds the widget and returns it for initialization
   */
  protected _buildWidget() : FlexUIWidget {
    this.params.height = this.params.height ?? 5;

    this.lineLength = this.params.lineLength ?? 50;
    this.dashLength = this.params.dashLength ?? 4;
    this.dashSpacing = this.params.dashSpacing ?? 4;
    this.lineThickness = this.params.lineThickness ?? 2;

    // Convert alignments into arrays
    if (typeof this.params.alignment === 'undefined') {
      this.params.alignment = { horizontal: ['center'], vertical: ['center'] };
    } else {
      const removeDuplicates : <T>(array : T[]) => T[] =
        <T>(array : T[]) : T[] =>
          array.filter((value : T, index : number) : boolean => value && array.indexOf(value) === index);

      // Horizontal
      if (this.params.alignment.horizontal === 'all') {
        // all
        this.horizontalAlignment = ['left', 'center', 'right'];
      } else if (typeof this.params.alignment.horizontal === 'string') {
        // left | center | right
        this.horizontalAlignment = [this.params.alignment.horizontal];
      } else if (typeof this.params.alignment.horizontal === 'undefined') {
        // undefined
        this.horizontalAlignment = ['center'];
      } else {
        // array
        this.horizontalAlignment = removeDuplicates(this.params.alignment.horizontal);
      }
      
      // Vertical
      if (this.params.alignment.vertical === 'all') {
        // all
        this.verticalAlignment = ['top', 'center', 'bottom'];
      } else if (typeof this.params.alignment.vertical === 'string') {
        // top | center | bottom
        this.verticalAlignment = [this.params.alignment.vertical];
      } else if (typeof this.params.alignment.vertical === 'undefined') {
        // undefined
        this.verticalAlignment = ['center'];
      } else {
        // Array
        this.verticalAlignment = removeDuplicates(this.params.alignment.vertical);
      }
    }

    const numColumns : number = this.horizontalAlignment.length;

    const replaceUndefined : <T>(array : T[], defaultValue : T) => T[] =
    <T>(array : T[], defaultValue : T) : T[] =>
      array.map((value : T) : T => value ?? defaultValue);

    const duplicateValue : <T>(value : T, count : number) => T[] =
      <T>(value : T, count : number) : T[] => new Array(count).join('|').split('|').map(() : T => value) as T[];

    const defaultSeparatorStyle : SeparatorStyle = 'solid';
    if (typeof this.params.separatorStyle === 'undefined') {
      this.separatorStyle = duplicateValue(defaultSeparatorStyle, numColumns);
    } else {
      if (typeof this.params.separatorStyle === 'string') {
        // solid | dashed | invisible
        this.separatorStyle = duplicateValue(this.params.separatorStyle, numColumns);
      } else {
        // Array
        const arrayLength = this.params.separatorStyle.length;
        this.params.separatorStyle = replaceUndefined(this.params.separatorStyle, defaultSeparatorStyle);

        if (arrayLength === numColumns) {
          // Equal length, just set
          this.separatorStyle = this.params.separatorStyle;
        } else if (arrayLength > numColumns) {
          // More than needed, just truncate
          this.separatorStyle = this.params.separatorStyle.slice(0, numColumns);
        } else {
          // Less than needed, duplicate the previous value
          this.separatorStyle = this.params.separatorStyle.concat(...duplicateValue(defaultSeparatorStyle, numColumns - arrayLength));
        }
      }
    }

    const defaultLineStyle : LineStyle = 'outset';
    if (typeof this.params.lineStyle === 'undefined') {
      this.lineStyle = duplicateValue(defaultLineStyle, numColumns);
    } else {
      if (typeof this.params.lineStyle === 'string') {
        // outset | inset | flat
        this.lineStyle = duplicateValue(this.params.lineStyle, numColumns);
      } else {
        // Array
        this.params.lineStyle = replaceUndefined(this.params.lineStyle, defaultLineStyle);
        const arrayLength = this.params.lineStyle.length;
        
        if (arrayLength === numColumns) {
          // Equal length, just set
          this.lineStyle = this.params.lineStyle;
        } else if (arrayLength > numColumns) {
          // More than needed, just truncate
          this.lineStyle = this.params.lineStyle.slice(0, numColumns);
        } else {
          // Less than needed, duplicate the previous value
          this.lineStyle = this.params.lineStyle.concat(...duplicateValue(defaultLineStyle, numColumns - arrayLength));
        }
      }
    }

    // Do this differently because the different colors with inset, outset, and rect
    const defaultLineColours : Record<LineStyle, number> = { 'outset': Colour.White, 'inset': Colour.White, 'flat': 255 };

    if (typeof this.params.lineColour === 'undefined') {
      this.lineColour = this.lineStyle.map((style : LineStyle, col : number) : number => defaultLineColours[style]);
    } else {
      if (typeof this.params.lineColour === 'number') {
        this.lineColour = duplicateValue(this.params.lineColour, numColumns);
      } else {
        // Array
        this.params.lineColour = this.params.lineColour.map((colour : number, index : number) : number =>
          typeof colour === 'undefined' ? defaultLineColours[this.lineStyle[index]] :
          colour
        );

        const arrayLength = this.params.lineColour.length;
        
        if (arrayLength === numColumns) {
          // Equal length, just set
          this.lineColour = this.params.lineColour;
        } else if (arrayLength > numColumns) {
          // More than needed, just truncate
          this.lineColour = this.params.lineColour.slice(0, numColumns);
        } else {
          // Less than needed, add defaults
          this.lineColour = this.params.lineColour.concat(
            this.lineStyle.slice(numColumns - arrayLength - 1)
              .map((style : LineStyle, index : number) : number =>
                defaultLineColours[this.lineStyle[index]]
            )
          );
        }
      }
    }

    return widget({
      type: 'custom',
      padding: this.params.padding,
      width: this.params.width,
      height: typeof this.params.height === 'number' ? this.params.height + 1 : this.params.height,
      disabled: this.params.disabled,
      visibility: this.params.visibility,

      onDraw: this._onDraw.bind(this),
    });
  }

  /**
   * Handles onDraw event
   * @param g GraphicsContext to draw with
   */
  private _onDraw(g : GraphicsContext) : void {
    // DEBUG
    // g.fill = 10; // Fill black
    // g.stroke = 10; // Border black
    // g.rect(0, 0, g.width, g.height);



    // Either allow one big line, or 2-3 smaller lines, and divide length up evenly
    const lineLength : number = Math.min(this.lineLength!, g.width / this.horizontalAlignment.length);
    const dashLength : number = Math.min(this.dashLength!, lineLength);
    const dashSpacing : number = Math.min(this.dashSpacing!, lineLength - dashLength);

    // Count how many full spaces and dashes we can fit per column
    // 1 less than the number of dashes that will be drawn
    // Default to 0 if separatorStyle === 'solid'
    const numDashSpaces : number = Math.floor((lineLength - dashLength) / (dashLength + dashSpacing));

    // One dash + pairs of dashes and spaces
    const actualLength : number = dashLength + numDashSpaces * (dashLength + dashSpacing);

    // By column
    for (let h = 0; h < this.horizontalAlignment.length; ++h) {
      const horizAlign : HorizontalAlignment = this.horizontalAlignment[h];
      const columnSeparatorStyle : SeparatorStyle = this.separatorStyle[h];
      const columnLineStyle : LineStyle = this.lineStyle[h];

      // Skip if invisible
      if (columnSeparatorStyle === 'invisible') {
        continue;
      }

      // Set color
      g.colour = this.lineColour[h];

      // Map the color a little for g.fill because palettes
      if (this.lineColour[h] === Colour.White) {
        g.fill = 21;
      } else if (this.lineColour[h] === Colour.Black) {
        g.fill = 1;
      } else {
        g.fill = this.lineColour[h];
      }

      // Get the section's starting X value
      // Always draw from left to right
      let sectionX : number;
      switch (horizAlign) {
        case 'left': {
          // Always start at the start
          sectionX = 0;
          break;
        } case 'center': {
          // Calculate left edge of the line from the middle
          if (columnSeparatorStyle === 'solid') {
            sectionX = (g.width - lineLength) / 2;
          } else {
            sectionX = (g.width - actualLength) / 2;
          }

          break;
        } case 'right': {
          // Calculate the left edge of the line from the right
          if (columnSeparatorStyle === 'solid') {
            sectionX = g.width - lineLength;
          } else {
            sectionX = g.width - actualLength;
          }
          
          break;
        }
      }

      // Row in that column
      for (let v = 0; v < this.verticalAlignment.length; ++v) {
        const vertAlign : VerticalAlignment = this.verticalAlignment[v];
        
        // Get the section's starting Y value
        let sectionY : number;
        switch (vertAlign) {
          case 'top': {
            sectionY = 0;
            break;
          } case 'center': {
            sectionY = (g.height - this.lineThickness) / 2;
            break;
          } case 'bottom': {
            sectionY = g.height - this.lineThickness;
            break;
          }
        }

        if (columnSeparatorStyle === 'solid' || (columnLineStyle === 'flat' && dashSpacing === 0)) {
          // If style is 'solid' or style is 'flat' and we have no spacing between dashes, just draw a solid line
          this._drawSegment(g, sectionX, sectionY, lineLength, this.lineThickness, columnLineStyle);
        } else if (columnSeparatorStyle === 'dashed') {
          // Draw numDashSpaces number of line segments
          // x is always on the left edge
          for (let x : number = sectionX; x < sectionX + actualLength; x += dashLength + dashSpacing) {
            this._drawSegment(g, x, sectionY, dashLength, this.lineThickness, columnLineStyle);
          }
        }
      }
    }
  }

  /**
   * Abstracts away drawing the line segment
   * @param g GraphicsContext given by the custom widget's onDraw
   * @param x Start x
   * @param y Start y
   * @param length Segment length
   * @param thickness Segment thickness
   * @param style LineStyle to determine which type of drawing is done
   */
  private _drawSegment(g : GraphicsContext, x : number, y : number, length : number, thickness : number, style : LineStyle) : void {
    switch (style) {
      case 'outset': {
        g.box(x, y, length, thickness);
        break;
      } case 'inset': {
        g.well(x, y, length, thickness);
        break;
      } case 'flat': {
        g.rect(x, y, length, thickness);
        break;
      }
    }
  }
}