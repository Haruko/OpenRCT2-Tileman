/// <reference path='../../../lib/openrct2.d.ts' />

import { TabCreator, WindowTemplate, horizontal, label, tab, tabwindow, vertical } from "openrct2-flexui";
import { getPluginConfig } from "../../data";
import { TilemanWindow } from "./TilemanWindow";
import { AnimatedSprites, ButtonID, FlexUIWidget } from "../../ui";
import { StatefulButtonGroup } from "../elements/ToggleButtonGroup";
import { ToggleButton } from "../elements/ToggleButton";
import { DoubleClickButton } from "../elements/DoubleClickButton";
import { deleteGuests, deleteRides, fireStaff } from "../../park";

const PluginConfig = getPluginConfig();





export class ConfigWindow extends TilemanWindow {
  private readonly debugButtonGroup : StatefulButtonGroup = new StatefulButtonGroup();
  
  constructor() {
    super(PluginConfig.configWindowTitle);
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
      width: (90 * 3) + (3 * 4), // 3 buttons + 4 spacers
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
        label({
          text: '{WHITE}Config',
          height: 14
        })
      ]
    });
  }
  
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
    this.uiElementsMap[ButtonID.FIRE_STAFF_BUTTON] = this._createUIElement(ButtonID.FIRE_STAFF_BUTTON);
    this.uiElementsMap[ButtonID.DELETE_GUESTS_BUTTON] = this._createUIElement(ButtonID.DELETE_GUESTS_BUTTON);
    this.uiElementsMap[ButtonID.DELETE_RIDES_BUTTON] = this._createUIElement(ButtonID.DELETE_RIDES_BUTTON);

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
            (this.uiElementsMap[ButtonID.FIRE_STAFF_BUTTON] as DoubleClickButton).widget,
            (this.uiElementsMap[ButtonID.DELETE_GUESTS_BUTTON] as DoubleClickButton).widget,
            (this.uiElementsMap[ButtonID.DELETE_RIDES_BUTTON] as DoubleClickButton).widget
          ]
        }),
        instructionLabel
      ]
    });
  }

  /**
   * Creates buttons, ToggleButtons, DoubleClickButtons, and other singular UI controls
   * @param buttonId 
   * @returns 
   */
  private _createUIElement(buttonId : ButtonID) : ToggleButton | FlexUIWidget {
    let newElement : ToggleButton | FlexUIWidget;

    switch (buttonId) {
      case ButtonID.FIRE_STAFF_BUTTON: {
        newElement = new DoubleClickButton(ButtonID.FIRE_STAFF_BUTTON, {
          text: 'Fire Staff',
          tooltip: 'Fires all staff',
          width: 90,
          height: 14,
          onChange: this.onFireStaffChange.bind(this)
        }, this.debugButtonGroup);

        this.debugButtonGroup.addButton(newElement);
        break;
      } case ButtonID.DELETE_GUESTS_BUTTON: {
        newElement = new DoubleClickButton(ButtonID.DELETE_GUESTS_BUTTON, {
          text: 'Delete Guests',
          tooltip: 'Deletes the guests from the park',
          width: 90,
          height: 14,
          onChange: this.onDeleteGuestsChange.bind(this)
        }, this.debugButtonGroup);

        this.debugButtonGroup.addButton(newElement);
        break;
      } case ButtonID.DELETE_RIDES_BUTTON: {
        newElement = new DoubleClickButton(ButtonID.DELETE_RIDES_BUTTON, {
          text: 'Delete Rides',
          tooltip: 'Deletes all rides from the park and removes their stats from exp calculation',
          width: 90,
          height: 14,
          onChange: this.onDeleteRidesChange.bind(this)
        }, this.debugButtonGroup);

        this.debugButtonGroup.addButton(newElement);
        break;
      }
    }

    return newElement!;
  }





  /**
   * **********
   * Event Handling
   * **********
   */

  /**
   * Handles onOpen event
   */
  protected onOpen() : void {
    
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
  protected onClose() : void {
    
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  onFireStaffChange(isPressed : boolean) : void {
    fireStaff();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  onDeleteGuestsChange(isPressed : boolean) : void {
    deleteGuests();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  onDeleteRidesChange(isPressed : boolean) : void {
    deleteRides();
  }
}