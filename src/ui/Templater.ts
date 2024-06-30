import { ElementID } from './types/enums';
import { UIElement } from './types/types';

export abstract class Templater<T> {
  private readonly _uiElementMap : Partial<Record<ElementID, UIElement>> = {};
  protected template! : T;

  constructor() {
  }

  /**
   * Builds the template for initialization
   * @returns Template of type T
   */
  protected abstract _buildTemplate() : T;

  /**
   * Retrieves the template
   */
  public getTemplate() : T {
    return this.template;
  }

  /**
   * Registers a new element to the list of elements
   * @param id ID to register to
   * @param el Element to register
   * @returns True if the instance was set, otherwise false 
   */
  protected registerElement(id : ElementID, el : UIElement) : boolean {
    if (typeof this._uiElementMap[id] === 'undefined') {
      this._uiElementMap[id] = el;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Gets a UI element from the map
   * @param id ElementID to get instance of
   * @returns Button instance
   */
  public getChildElement(id : ElementID) : UIElement | undefined {
    return this._uiElementMap[id];
  }
}