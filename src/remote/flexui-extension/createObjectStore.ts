import { DefaultObjectStore } from '@flexui-ext/DefaultObjectStore';
import { ObjectStore } from '@flexui-ext/ObjectStore';

/**
 * Create an array that can be observed by the user interface for modifications.
 *
 * Tip: Stores work best if you only use them for binding a model to your user
 * interface, and nowhere else.
 */
export function objectStore<T>() : ObjectStore<T>;
export function objectStore<T>(initialValue: Record<string, T>) : ObjectStore<T>;
export function objectStore<T>(initialValue?: Record<string, T>) : ObjectStore<T> {
  return new DefaultObjectStore<T>(initialValue || {} as Record<string, T>);
}
