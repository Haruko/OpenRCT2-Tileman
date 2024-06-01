import { isKeyValuePair, isObject, KeyValuePair } from '@typedefs/KeyValuePair';
import { DefaultStore } from "@flexui-ext/flexui/defaultStore";
import { ObjectStore } from "@flexui-ext/ObjectStore";





/**
 * A store implementation that manages a cached array.
 */
export class DefaultObjectStore<T> extends DefaultStore<Record<string, T>> implements ObjectStore<T> {
	constructor(obj? : Record<string, T>) {
		super({});
		if (typeof obj !== 'undefined') {
			this.set(obj);
		}
	}

  /**
   * Updates the current value to a new one.
   * Notifies all listeners with the updated object.
   * @param value The new value.
   */
  set(obj : Record<string, T>) : void;

  /**
   * Updates the current value to a new one.
   * Notifies all listeners with the updated object.
   * @param value The new value.
   */
  set(keyValuePair : KeyValuePair<T>) : void;

  /**
   * Updates the element at the specified key.
   * Notifies all listeners with the updated object.
   * @param key Key to update.
   * @param value Value to set.
   */
  set(key : string, value : T) : void;

  set(unknownType : Record<string, T> | KeyValuePair<T> | Exclude<string, ''>, value? : T) : void {
    if (typeof unknownType === 'string') {
			const key : string = unknownType;

			if (typeof value === 'undefined') {
				// Delete if unsetting value
				delete this._value[key];
			} else {
				// Set value
				this._value[key] = value;
			}
    } else if (isKeyValuePair(unknownType)) {
			const pair : KeyValuePair<T> = unknownType;

			if (typeof pair.value === 'undefined') {
				// Delete if unsetting value
				delete this._value[pair.key];
			} else {
				// Set value
				this._value[pair.key] = pair.value;
			}
		} else if (isObject(unknownType)) {
			const obj : object = unknownType;
			// Overwrite the whole object
			// Clear previous keys
			Object.keys(this._value).forEach((key : string) : void => {
				delete this._value[key];
			});

			// Copy over key-by-key so _value isn't accidentally exposed
			Object.keys(obj).forEach((key : string) : void => {
				this._value[key] = obj[key as keyof typeof obj] as T;
			});
		}
		
		// Update listeners with entire object
		this._updateListeners(this._value);
  }

  /**
   * Gets clone of the value;
   */
  override get() : Record<string, T> {
    const newObj : Record<string, T> = {};

    for(const key in this._value) {
      newObj[key] = this._value[key];
    }

		return newObj;
	}

  /**
   * Gets value of a specific key.
   * @param key Key to get value of, or undefined to get entire object.
   */
  getValue(key? : string) : T | undefined {
    if(typeof key !== 'undefined' && key in this._value) {
      return this._value[key];
    } else {
      return undefined;
    }
  }

  /**
   * Get array of keys.
   */
  getKeys() : string[] {
    return Object.keys(this._value);
  }

  /**
   * Get array of values.
   */
  getValues() : T[] {
    return Object.keys(this._value).map((key : string) : T => this._value[key]);
  }

  /**
   * Call the underlying array method with the same name using the supplied arguments.
   */
  // private _wrapArrayMethod<K extends keyof ArrayStore<T>>(method: K): (...args: Parameters<ArrayStore<T>[K]>) => ReturnType<ArrayStore<T>[K]>
  // {
  //   // eslint-disable-next-line @typescript-eslint/no-this-alias
  //   const store = this;
  //   return function(...args: unknown[]): never
  //   {
  //     const array = store._value;
  //     const arrayMethod = <(...arg: unknown[]) => unknown>array[<keyof Array<T>>method];
  //     const value = arrayMethod.apply(array, args);
  //     store._updateListeners(array);
  //     return <never>value;
  //   };
  // }
}