// From https://github.dev/Basssiiie/OpenRCT2-FlexUI

import { Store } from "openrct2-flexui";
import { Event, invoke } from "@flexui-ext/flexui/event";


/**
 * The default implementation of a read-only store.
 */
export abstract class DefaultStore<T> implements Store<T> {
  protected _listeners? : Event<T>;

  constructor(protected _value: T) {

  }

  get(): T {
    return this._value;
  }
  
  subscribe(callback: (value: T) => void) : () => void {
    if (!this._listeners) {
      this._listeners = [ callback ];
    }
    else {
      this._listeners.push(callback);
    }
    
    const subscriptions = this._listeners;
    return (): void => {
      const index = subscriptions.indexOf(callback);
      if (index !== -1) {
        subscriptions.splice(index, 1);
      }
    };
  }
  
  protected _updateListeners(value: T): void {
    if (this._listeners) {
      invoke(this._listeners, value);
    }
  }
}