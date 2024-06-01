/**
 * Checks if something is an object
 * @param item Item to check
 * @returns True if it is a non-array, non-null object
 */
export function isObject(item : any) : item is Record<string, any> {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
}

/**
 * Simplifies definition of a <key, value> pair
 */
export type KeyValuePair<T> = {key : string, value : T};

/**
 * Checks if item conforms to KeyValuePair<T>
 * @param item Item to check
 * @returns True if item conforms to KeyValuePair<T>
 */
export function isKeyValuePair(item : any) : item is KeyValuePair<any> {
  return isObject(item) && typeof item.key !== 'undefined';
}