/// <reference path='../../../lib/openrct2.d.ts' />

import { ElementID } from '../types/enums';
import { DoubleClickButton } from './DoubleClickButton';
import { ToggleButton } from './ToggleButton';





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
   * @param triggerChange true if we should trigger onChange events for each button
   */
  depressOthers(activeButtonId? : ElementID, triggerChange? : boolean) : void {
    this.buttons.forEach((button : StatefulButton) : void => {
      if(button.buttonId !== activeButtonId) {
        if (button instanceof DoubleClickButton) {
          button.cancelDoubleClick();
        } else {
          button.depress();
          if (triggerChange) {
            button.onChange();
          }
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