// From https://github.dev/Basssiiie/OpenRCT2-FlexUI

/**
 * Event list with typed parameters.
 */
export type Event<T = never> = ((params: T) => void)[];


/**
 * Invoke the specified event and all its registered callbacks.
 */
export function invoke(event : Event<never>) : void;
export function invoke<T>(event : Event<T>, params: T) : void;
export function invoke(event : Event<never>, params? : never) : void {
  for (let i = 0, e = event.length; i < e; i++) {
    event[i](<never>params);
  }
}