/// <reference path='../../../../lib/openrct2.d.ts' />

import { AnimatedSprites, ElementID } from '@src/ui/types/enums';
import { IWindow } from '../IWindow';
import { BaseTab } from './BaseTab';
import { TabCreator, horizontal, label, tab, vertical } from 'openrct2-flexui';
import { FlexUIWidget } from '@src/ui/types/types';
import { DoubleClickButton } from '@src/ui/elements/DoubleClickButton';
import { Park } from '@src/Park';
import { StatefulButtonGroup } from '@src/ui/elements/StatefulButtonGroup';

export class DebugTab extends BaseTab {
  private _debugButtonGroup! : StatefulButtonGroup;

  private get debugButtonGroup() : StatefulButtonGroup {
    return this._debugButtonGroup;
  }

  private set debugButtonGroup(group : StatefulButtonGroup) {
    if (typeof this._debugButtonGroup === 'undefined') {
      this._debugButtonGroup = group;
    } else {
      throw 'Reassigning readonly value.';
    }
  }

  
  
  constructor(parent : IWindow) {
    super(parent);
  }



  /**
   * **********
   * Template Construction
   * **********
   */

  /**
   * Builds the template for initialization
   * @returns Template of type TabCreator
   */
  protected _buildTemplate() : TabCreator {
    this.debugButtonGroup = new StatefulButtonGroup();

    const buttonPanel = this._buildDebugButtonPanel();
  
    return tab({
      image: AnimatedSprites.WRENCH,
      content: [
        vertical({
          spacing: 2,
          padding: 0,
          content: [
            label({
              text: '{WHITE}Debug',
              height: 14,
              alignment: 'centred',
            }),
            buttonPanel
          ],
        })
      ],
    });
  }
  
  /**
   * Builds debug button panel
   */
  private _buildDebugButtonPanel() : FlexUIWidget {
    const fireStaffButton : DoubleClickButton = this._createDebugButton(ElementID.FIRE_STAFF_BUTTON);
    const deleteGuestsButton : DoubleClickButton = this._createDebugButton(ElementID.DELETE_GUESTS_BUTTON);
    const deleteRidesButton : DoubleClickButton = this._createDebugButton(ElementID.DELETE_RIDES_BUTTON);
    const clearPathsButton : DoubleClickButton = this._createDebugButton(ElementID.CLEAR_PATHS_BUTTON);

    const instructionLabel = label({
      text: '{WHITE}Double click to use buttons',
      alignment: 'centred',
      height: 14
    });
  
    return vertical({
      spacing: 2,
      padding: 0,
      content: [
        horizontal({
          spacing: 3,
          padding: 0,
          content: [
            fireStaffButton.widget,
            deleteGuestsButton.widget,
            deleteRidesButton.widget,
          ]
        }),
        horizontal({
          spacing: 3,
          padding: 0,
          content: [
            clearPathsButton.widget,
          ]
        }),
        instructionLabel
      ]
    });
  }

  /**
   * Creates buttons for debug button panel
   * @param id ElementID of element to make
   * @returns The element
   */
  private _createDebugButton(id : ElementID) : DoubleClickButton {
    let newElement! : DoubleClickButton;

    switch (id) {
      case ElementID.FIRE_STAFF_BUTTON: {
        newElement = new DoubleClickButton(ElementID.FIRE_STAFF_BUTTON, {
          text: 'Fire Staff',
          tooltip: 'Fires all staff',
          width: '33%',
          height: 14,
          onChange: this.onFireStaffChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.FIRE_STAFF_BUTTON, newElement);
        break;
      } case ElementID.DELETE_GUESTS_BUTTON: {
        newElement = new DoubleClickButton(ElementID.DELETE_GUESTS_BUTTON, {
          text: 'Delete Guests',
          tooltip: 'Deletes the guests inside the park',
          width: '33%',
          height: 14,
          onChange: this.onDeleteGuestsChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.DELETE_GUESTS_BUTTON, newElement);
        break;
      } case ElementID.DELETE_RIDES_BUTTON: {
        newElement = new DoubleClickButton(ElementID.DELETE_RIDES_BUTTON, {
          text: 'Delete Rides',
          tooltip: 'Deletes all rides from the park and removes their stats from exp calculation',
          width: '33%',
          height: 14,
          onChange: this.onDeleteRidesChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.DELETE_RIDES_BUTTON, newElement);
        break;
      } case ElementID.CLEAR_PATHS_BUTTON: {
        newElement = new DoubleClickButton(ElementID.CLEAR_PATHS_BUTTON, {
          text: 'Delete Paths',
          tooltip: 'Deletes all paths inside the park',
          width: '33%',
          height: 14,
          onChange: this.onClearPathsChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.CLEAR_PATHS_BUTTON, newElement);
        break;
      }
    }

    return newElement;
  }



  /**
   * **********
   * Event Handling
   * **********
   */

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  private onFireStaffChange(isPressed : boolean) : void {
    Park.instance<Park>().fireStaff();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  private onDeleteGuestsChange(isPressed : boolean) : void {
    Park.instance<Park>().deleteGuests();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  private onDeleteRidesChange(isPressed : boolean) : void {
    Park.instance<Park>().deleteRides();
  }

  /**
   * Handles clicks on clear paths button
   * @param isPressed whether the button is pressed or not
   */
  private onClearPathsChange(isPressed : boolean) : void {
    Park.instance<Park>().clearPaths();
  }
}