/// <reference path='../../lib/openrct2.d.ts' />

import { ButtonID } from "../ui";
import { DoubleClickButton } from "./DoubleClickButton";
import { ToggleButton } from "./ToggleButton";





type StatefulButton = ToggleButton | DoubleClickButton;

/**
 * Keeps track of a group of buttons and only lets one be pressed at any given time
 * Supports ToggleButton and DoubleClickButton
 */
export class StatefulButtonGroup {
  readonly buttons : StatefulButton[] = [];

  /**
   * Adds a button to the group
   */
  addButton(button : StatefulButton) : void {
    this.buttons.push(button);
  }

  /**
   * Depress all but the active button, or all buttons if no ButtonID is supplied
   * @param activeButtonId the ButtonID for the one button that is activated. If undefined, depress all
   */
  depressOthers(activeButtonId? : ButtonID) : void {
    this.buttons.forEach((button : StatefulButton) : void => {
      if(button.buttonId !== activeButtonId) {
        if (button instanceof DoubleClickButton) {
          button.cancelDoubleClick();
        } else {
          button.depress();
        }
      }
    });
  }

  /**
   * Depress all the buttons
   */
  depressAll() : void {
    this.depressOthers();
  }
}