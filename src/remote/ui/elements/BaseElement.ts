/// <reference path='../../../../lib/openrct2.d.ts' />

import { FlexUIWidget } from '../types/types';
import { ElementID } from '../types/enums';





export abstract class BaseElement<ParamsType> {
  public readonly id : ElementID;
  public readonly widget : FlexUIWidget;
  protected readonly params : ParamsType;

  constructor(id : ElementID, params : ParamsType) {
    this.id = id;
    this.params = params;
    this.widget = this._buildWidget();
  }

  /**
   * Builds the widget and returns it for initialization
   */
  protected abstract _buildWidget() : FlexUIWidget;
}