/// <reference path='../../../lib/openrct2.d.ts' />

import { TabCreator, WindowTemplate, WritableStore, button, horizontal, label, read, store, tab, tabwindow, textbox, vertical } from 'openrct2-flexui';
import { StatefulButtonGroup } from '../elements/StatefulButtonGroup';
import { BaseWindow } from './BaseWindow';
import { AnimatedSprites, ElementID, WindowID } from '../types/enums';
import { FlexUIWidget } from '../types/types';
import { DoubleClickButton } from '../elements/DoubleClickButton';
import { Park } from '@src/Park';
import { Plugin, PluginData } from '@src/Plugin';





export class ConfigWindow extends BaseWindow {
  private readonly _debugButtonGroup : StatefulButtonGroup = new StatefulButtonGroup();
  private readonly settingsStores : Partial<Record<ElementID, WritableStore<string>>> = {};
  
  constructor() {
    super(WindowID.CONFIG, 'Tileman Config');

    this.template = this._buildWindowTemplate();
  }
  

  
  /**
   * **********
   * Template Construction
   * **********
   */

  /**
   * Builds the window template for initialization
   * @returns WindowTemplate
   */

  protected _buildWindowTemplate() : WindowTemplate {
    const configTab : TabCreator = this._buildConfigTab();
    const debugTab : TabCreator = this._buildDebugTab();
  
    return tabwindow({
      title: this.windowTitle,
      width: 283, // 3x90px + 4x3px + 1px for some reason
      height: 'auto',
      padding: 3,
      startingTab: 0,
      tabs: [
        configTab,
        debugTab,
      ],
      onOpen: this.onOpen.bind(this),
      onUpdate: this.onUpdate.bind(this),
      onClose: this.onClose.bind(this)
    });
  }

  /**
   * Builds the config tab
   */
  private _buildConfigTab() : TabCreator {
    return tab({
      image: AnimatedSprites.RESEARCH,
      content: [
        vertical({
          content: [
            label({
              text: '{WHITE}Config',
              height: 14
            }),
            this._buildConfigSettingPanel(),
            this._buildConfigButtonPanel(),
          ]
        })
      ],
    });
  }

  /**
   * Makes the list of config option controls for the config tab of the config window
   */
  private _buildConfigSettingPanel() : FlexUIWidget {
    const ticksPerUpdateRow : FlexUIWidget = this._createConfigRow(ElementID.TICKS_PER_UPDATE, 'ticksPerUpdate', 'Game ticks per update');
    const minTilesRow : FlexUIWidget = this._createConfigRow(ElementID.MIN_TILES, 'minTiles', 'Starting tiles');
    const expPerTileRow : FlexUIWidget = this._createConfigRow(ElementID.EXP_PER_TILE, 'expPerTile', 'Tile XP cost');
    const expPerParkAdmissionRow : FlexUIWidget = this._createConfigRow(ElementID.EXP_PER_PARK_ADMISSION, 'expPerParkAdmission', 'XP per park admission');
    const rideExpPerCustomerRow : FlexUIWidget = this._createConfigRow(ElementID.EXP_PER_RIDE_ADMISSION, 'rideExpPerCustomer', 'XP per ride admission');
    const stallExpPerCustomerRow : FlexUIWidget = this._createConfigRow(ElementID.EXP_PER_STALL_ADMISSION, 'stallExpPerCustomer', 'XP per stall admission');
    const facilityExpPerCustomerRow : FlexUIWidget = this._createConfigRow(ElementID.EXP_PER_FACILITY_ADMISSION, 'facilityExpPerCustomer', 'XP per facility admission');

    return vertical({
      content: [
        ticksPerUpdateRow,
        minTilesRow,
        expPerTileRow,
        expPerParkAdmissionRow,
        rideExpPerCustomerRow,
        stallExpPerCustomerRow,
        facilityExpPerCustomerRow,
      ],
    });
  }
  
  /**
   * Creates row for config options with a text label and a textbox
   * @param id ElementID of row to make
   * @param key Key for Plugin.get()
   * @param labelText String to show in the label
   * @returns The row
   */
  private _createConfigRow(id : ElementID, key : keyof PluginData, labelText : string) : FlexUIWidget {
    // Make the label
    const newLabel = label({
      text: labelText,
      width: '65%',
    });

    // Make the textbox
    const defaultValue : string = read(Plugin.get(key)) + '';
    const textStore : WritableStore<string> = store<string>(defaultValue);

    this.settingsStores[id] = textStore;
    
    const newTextbox = textbox({
      width: '35%',
      padding: 0,
      text: { twoway : textStore },
      maxLength: 9,
      onChange: (text : string) : void => {
        // Filter out non-numbers
        let newText : string = text.replace(/[^\d]+/g, '');

        // Remove leading zeroes
        newText = newText.replace(/^0+/, '');

        newText = newText === '' ? '0' : newText;
  
        if (newText !== text) {
          textStore.set(newText);
        }
      },
    });

    this.registerElement(id, newTextbox);

    return horizontal({
      spacing: 0,
      content: [
        newLabel,
        newTextbox,
      ]
    });
  }

  /**
   * Makes the list of config option controls for the config tab of the config window
   */
  private _buildConfigButtonPanel() : FlexUIWidget {
    const defaultsButton : FlexUIWidget = button({
      text: 'Defaults',
      width: '25%',
      height: 14,
      padding: { right: '25%' },
      onClick: () : void => {
        // Reset Plugin values to defaults
        // Set all settings back to default values
      }
    });
    this.registerElement(ElementID.CONFIG_DEFAULTS, defaultsButton);

    const cancelButton : FlexUIWidget = button({
      text: 'Cancel',
      width: '25%',
      height: 14,
      onClick: () : void => {
        // Set all settings back to Plugin.get() value
      }
    });
    this.registerElement(ElementID.CONFIG_CANCEL, cancelButton);

    const saveButton : FlexUIWidget = button({
      text: 'Save',
      width: '25%',
      height: 14,
      onClick: () : void => {
        // Save all settings with Plugin.set
      }
    });
    this.registerElement(ElementID.CONFIG_SAVE, saveButton);

    return horizontal({
      content: [
        defaultsButton,
        cancelButton,
        saveButton,
      ],
    });
  }

  /**
   * Creates element for config options
   * @returns The element
   */
  
  /**
   * Builds the debug tab
   */
  private _buildDebugTab() : TabCreator {
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
              height: 14
            }),
            buttonPanel
          ]
        })
      ]
    });
  }

  /**
   * Builds debug button panel
   */
  private _buildDebugButtonPanel() : FlexUIWidget {
    const fireStaffButton : DoubleClickButton = this._createDebugButton(ElementID.FIRE_STAFF_BUTTON);
    const deleteGuestsButton : DoubleClickButton = this._createDebugButton(ElementID.DELETE_GUESTS_BUTTON);
    const deleteRidesButton : DoubleClickButton = this._createDebugButton(ElementID.DELETE_RIDES_BUTTON);

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
          width: 90,
          height: 14,
          onChange: this.onFireStaffChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.FIRE_STAFF_BUTTON, newElement);
        break;
      } case ElementID.DELETE_GUESTS_BUTTON: {
        newElement = new DoubleClickButton(ElementID.DELETE_GUESTS_BUTTON, {
          text: 'Delete Guests',
          tooltip: 'Deletes the guests from the park',
          width: 90,
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
          width: 90,
          height: 14,
          onChange: this.onDeleteRidesChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.DELETE_RIDES_BUTTON, newElement);
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
   * Handles onOpen event
   */
  protected override onOpen() : void {
    super.onOpen();
  }

  /**
   * Handles window update event
   */
  protected override onUpdate() : void {
    super.onUpdate();
  }

  /**
   * Handles window close event
   */
  protected override onClose() : void {
    super.onClose();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  onFireStaffChange(isPressed : boolean) : void {
    Park.fireStaff();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  onDeleteGuestsChange(isPressed : boolean) : void {
    Park.deleteGuests();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  onDeleteRidesChange(isPressed : boolean) : void {
    Park.deleteRides();
  }
}