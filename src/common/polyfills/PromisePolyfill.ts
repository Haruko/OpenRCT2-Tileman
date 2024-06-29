// (resolve, reject) => void
// Is a function that takes resolve and reject functions from the constructor
export type Executor<T> = (
  resolve : (value? : T | PromiseLike<T>) => void,
  reject : (reason? : any) => void
) => void;

// Error class for Promise.all
export class AggregateError extends Error {
  public errors : any[];

  constructor(errors : any[], message? : string) {
    super(message);
    this.errors = errors;
    
    this.name = 'AggregateError';
  }
};

export class PromisePolyfill<T> {
  // Current state of this promise
  private state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  // 
  private value : T | null = null;
  // 
  private reason : any = null;
  // List of all callbacks put on this promise for fulfillment
  private onFulfilledCallbacks : Array<(value? : T) => void> = [];
  // List of all callbacks put on this promise for rejection
  private onRejectedCallbacks : Array<(reason? : any) => void> = [];

  /**
   * Runs the executor using the internal resolve and reject functions
   * @param executor (resolve, reject) => void
   */
  constructor(executor : Executor<T>) {
    const resolve = (value? : T | PromiseLike<T>) : void => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value as T;
        
        this.onFulfilledCallbacks.forEach((callback : Function) : void => callback(this.value!));
      }
    };

    const reject = (reason? : any) : void => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        
        this.onRejectedCallbacks.forEach((callback : Function) : void => callback(this.reason!));
      }
    };

    // Try to run the executor function passed into the constructor
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Chain function callbacks to the end of this promise
   * @param onFulfilled Function to call on fulfillment
   * @param onRejected Function to call on rejection
   * @returns New promise
   */
  public then<TResolve = T, TReject = never>(
    onFulfilled?: (value? : T) => TResolve | PromiseLike<TResolve>,
    onRejected?: (reason? : any) => TReject | PromiseLike<TReject>
  ) : PromisePolyfill<TResolve | TReject> {
    return new PromisePolyfill<TResolve | TReject>((resolve, reject) : void => {
      switch (this.state) {
        case 'pending': {
          // Add callbacks to the two lists

          if (onFulfilled) {
            this.onFulfilledCallbacks.push((value? : T) : void => {
              try {
                const result : TResolve | PromiseLike<TResolve> = onFulfilled(value);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            });
          }
          
          if (onRejected) {
            this.onRejectedCallbacks.push((value? : T) : void => {
              try {
                const result : TReject | PromiseLike<TReject> = onRejected(value);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            });
          }

          break;
        } case 'fulfilled': {
          // Already fulfilled, so just immediately call the callback
          try {
            let result : TResolve | PromiseLike<TResolve>;
            if (onFulfilled) {
              result = onFulfilled(this.value!);
            } else {
              result = this.value as unknown as TResolve;
            }

            resolve(result);
          } catch (error) {
            reject(error);
          }

          break;
        } case 'rejected': {
          // Already rejected, so just immediately call the callback
          try {
            let result : TReject | PromiseLike<TReject>;
            if (onRejected) {
              result = onRejected(this.reason);
            } else {
              result = this.value as unknown as TReject;
            }
            
            resolve(result);
          } catch (error) {
            reject(error);
          }

          break;
        }
      }
    });
  }

  /**
   * Error-catching version of then()
   * @param onRejected Function to call on rejection
   * @returns Result of then(undefined, onRejected)
   */
  public catch<TReject = never>(
    onRejected? : (reason? : any) => TReject | PromiseLike<TReject>
  ) : PromisePolyfill<T | TReject> {
    return this.then(undefined, onRejected);
  }

  /**
   * Makes a new promise that immediately resolves
   * @param value Value to resolve with
   * @returns New promise that resolves
   */
  public static resolve<T>(value? : T | PromiseLike<T>) : PromisePolyfill<T> {
    if (value instanceof PromisePolyfill) {
      return value;
    } else {
      return new PromisePolyfill((resolve, _) : void => resolve(value));
    }
  }

  /**
   * Makes a new promise that immediately rejects
   * @param reason Reason to reject
   * @returns New promise that rejects
   */
  public static reject<T = never>(reason? : any) : PromisePolyfill<T> {
    return new PromisePolyfill((_, reject) : void => reject(reason));
  }

  /**
   * Waits for all promises to resolve or any to reject
   * @param promises Array of promises to wait for
   * @returns New promise that returns an array of promise results
   */
  public static all<T>(promises : (T | PromisePolyfill<T>)[]) : PromisePolyfill<(T | undefined)[]> {
    return new PromisePolyfill<(T | undefined)[]>((resolve, reject) : void => {
      const results : (T | undefined)[] = [];
      let completed : number = 0;

      promises.forEach((promise : T | PromisePolyfill<T>, index : number) : void =>{
        // Reject on the first rejection
        PromisePolyfill.resolve(promise).then((value? : T) : void => {
          // Collect all completions and, once they're all done, return the results
          results[index] = value;
          ++completed;

          if (completed === promises.length) {
            resolve(results);
          }
        }).catch(reject);
      });
    });
  }

  /**
   * Waits for any promise to resolve or all to reject
   * @param promises Array of promises to wait for
   * @returns New promise that returns the result of the first promise that resolves
   */
  public static any<T>(promises : (T | PromisePolyfill<T>)[]) : PromisePolyfill<T> {
    return new PromisePolyfill<T>((resolve, reject) : void => {
      const errors : any[] = [];
      let rejected : number = 0;

      promises.forEach((promise : T | PromisePolyfill<T>, index : number) : void =>{
        // Resolve on the first completion
        PromisePolyfill.resolve(promise).then(resolve)
          .catch((reason? : any) : void => {
            // Collect all rejections and, if they all reject, return the errors
            errors[index] = reason;
            ++rejected;

            if (rejected === promises.length) {
              reject(new AggregateError(errors, 'All Promises rejected'));
            }
          });
      });
    });
  }
};