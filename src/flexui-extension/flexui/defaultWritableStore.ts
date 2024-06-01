// From https://github.dev/Basssiiie/OpenRCT2-FlexUI

import { DefaultStore } from "./defaultStore";
import { WritableStore } from "openrct2-flexui";


/**
 * The default implementation of a store.
 */
export class DefaultWritableStore<T> extends DefaultStore<T> implements WritableStore<T> {
  set(value : T) : void {
    if (this._value !== value) {
      this._value = value;
      this._updateListeners(value);
    }
  }
}
