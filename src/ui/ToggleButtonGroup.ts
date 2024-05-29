/// <reference path='../../lib/openrct2.d.ts' />

import { ButtonID } from "../ui";
import { DoubleClickButton } from "./DoubleClickButton";
import { ToggleButton } from "./ToggleButton";

/**
 * A wrapping class for Toggle to keep things cleaner elsewhere
 */
export class ToggleButtonGroup {
  readonly buttons : ToggleButton[] = [];

  /**
   * Adds a button to the group
   */
  addButton(button : ToggleButton) : void {
    this.buttons.push(button);
  }

  depressOthers(activeButtonId : ButtonID) : void {
    this.buttons.forEach((button : ToggleButton) : void => {
      if(button.buttonId !== activeButtonId) {
        if (button instanceof DoubleClickButton) {
          button.cancelDoubleClick();
        } else {
          button.depress();
        }
      }
    });
  }
}