import { Bindable, button, compute, ElementVisibility, FlexibleLayoutParams, FlexiblePosition, groupbox, horizontal, Store, store, vertical, WritableStore } from 'openrct2-flexui';
import { ElementID } from '../types/enums';
import { BaseElement } from './BaseElement';
import { AlignedLabel } from './AlignedLabel';
import { FlexUIWidget } from '../types/types';

// Same as vertical params
export type CollapsibleSectionParams = FlexibleLayoutParams & FlexiblePosition & {
  // Text to display in header
  text : Bindable<string>,

  // Initial state of the collapse
  initialState? : boolean,

  // isOpen state of the collapsible
  isOpen : WritableStore<boolean>,

  // visibility for content
  visibility: Bindable<ElementVisibility>;
};

/**
 * A wrapping class for vertical to add collapsible functionality
 */
export class CollapsibleSection extends BaseElement<CollapsibleSectionParams> {
  protected isOpen! : WritableStore<boolean>;

  constructor(id : ElementID, params : CollapsibleSectionParams) {
    super(id, params as CollapsibleSectionParams);
  }

  /**
   * Creates stores for parent isOpen state and child visibility
   * @returns Object containing stores for parent isOpen state and child visibility
   */
  static createVisibilityStores() : {
    isOpen : WritableStore<boolean>,
    visibility : Store<ElementVisibility>
  } {
    // Overall isOpen state of collapsible section
    const isOpen : WritableStore<boolean> = store<boolean>(true);
    
    // Visibility store to use for children of collapsible section
    const visibility : Store<ElementVisibility> = compute<boolean, ElementVisibility>(
      isOpen,
      (isOpen : boolean) : ElementVisibility => {
      return isOpen ? 'visible' : 'none';
    });

    return {
      isOpen,
      visibility,
    };
  }

  /**
   * Builds the widget and returns it for initialization
   */
  protected _buildWidget() : FlexUIWidget {
    this.isOpen = this.params.isOpen;
    if (typeof this.params.initialState !== 'undefined') {
      this.isOpen.set(this.params.initialState);
    }

    return vertical({
      width: this.params.width,
      height: this.params.height,
      padding: this.params.padding,
      content: [
        horizontal({
          spacing: 4,
          padding: 0,
          content: [
            button({
              height: 13,
              width: 13,
              text: compute<boolean, string>(this.isOpen, (isOpen : boolean) : string => isOpen ? '>' : '<'),
              onClick: this.toggle.bind(this),
            }),
            
            new AlignedLabel(ElementID.NONE, {
              textAlignment: { horizontal: 'left', vertical: 'center' },
              text: this.params.text,
            }).widget,
          ],
        }),
        groupbox({
          visibility: this.params.visibility,
          content: this.params.content,
          padding: {
            top: 0,
            bottom: 4,
            left: 0,
            right: 0
          },
        }),
      ],
    } as FlexibleLayoutParams & FlexiblePosition);
  }

  /**
   * Open the collapsible
   */
  public open() {
    this.isOpen.set(true);
  }

  /**
   * Close the collapsible
   */
  public close() {
    this.isOpen.set(false);
  }

  /**
   * Toggle the collapsible open/close
   */
  public toggle() {
    this.isOpen.set(!this.isOpen.get());
  }
}