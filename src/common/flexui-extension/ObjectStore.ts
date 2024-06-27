import { Store } from 'openrct2-flexui';
import { KeyValuePair } from '@typedefs/KeyValuePair';



/**
 * A store for arrays that can be modified without replacing the entire array.
 */
export interface ObjectStore<T> extends Store<Record<string, T>> {
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
  set(key : string | number, value : T | undefined) : void;

  /**
   * Gets clone of the value;
   */
  get() : Record<string, T>;

  /**
   * Gets value of a specific key.
   * @param key Key to get value of.
   */
  getValue(key : string | number) : T | undefined;

  /**
   * Get array of keys.
   */
  getKeys() : string[];

  /**
   * Get array of values.
   */
  getValues() : T[];
}
