// (resolve, reject) => void
// Is a function that takes resolve and reject functions from the constructor
export type Executor<T> = (
  resolve : (value? : T | PromisePolyfill<T>) => void,
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
  private value : T | undefined;
  private reason : any;

  // List of all callbacks put on this promise for fulfillment
  private onFulfilledCallbacks : Array<(value? : T) => void> = [];
  // List of all callbacks put on this promise for rejection
  private onRejectedCallbacks : Array<(reason? : any) => void> = [];

  /**
   * Runs the executor using the internal resolve and reject functions
   * @param executor (resolve, reject) => void
   */
  constructor(executor : Executor<T>) {
    const resolve = (value? : T | PromisePolyfill<T>) : void => {
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
    onFulfilled?: ((value? : T) => TResolve | PromisePolyfill<TResolve>) | undefined,
    onRejected?: ((reason? : any) => TReject | PromisePolyfill<TReject>) | undefined
  ) : PromisePolyfill<TResolve | TReject> {
    return new PromisePolyfill<TResolve | TReject>((resolve, reject) : void => {
      switch (this.state) {
        case 'pending': {
          // Add callbacks to the two lists
          this.onFulfilledCallbacks.push((value? : T) : void => {
            try {
              if (typeof onFulfilled === 'function') {
                const result : TResolve | PromisePolyfill<TResolve> = onFulfilled(value);
                if (result instanceof PromisePolyfill) {
                  // Let the returned promise take care of resolving/rejecting
                  result.then(resolve, reject);
                } else {
                  // Resolve with the returned value
                  resolve(result);
                }
              } else {
                resolve(value as TResolve);
              }
            } catch (error) {
              reject(error);
            }
          });
          
          this.onRejectedCallbacks.push((value? : T) : void => {
            try {
              if (typeof onRejected === 'function') {
                const result : TReject | PromisePolyfill<TReject> = onRejected(value);

                if (result instanceof PromisePolyfill) {
                  // Let the returned promise take care of resolving/rejecting
                  result.then(resolve, reject);
                } else {
                  // Resolve with the returned value
                  resolve(result);
                }
              } else {
                resolve(value as TResolve);
              }
            } catch (error) {
              reject(error);
            }
          });

          break;
        } case 'fulfilled': {
          // Already fulfilled, so just immediately call the callback
          try {
            if (typeof onFulfilled === 'function') {
              const result : TResolve | PromisePolyfill<TResolve> = onFulfilled(this.value);
              if (result instanceof PromisePolyfill) {
                // Let the returned promise take care of resolving/rejecting
                result.then(resolve, reject);
              } else {
                // Resolve with the returned value
                resolve(result);
              }
            } else {
              resolve(this.value as TResolve);
            }
          } catch (error) {
            reject(error);
          }

          break;
        } case 'rejected': {
          // Already rejected
          try {
            if (typeof onRejected === 'function') {
              const reason : TReject | PromisePolyfill<TReject> = onRejected(this.reason);
              if (reason instanceof PromisePolyfill) {
                // Let the returned promise take care of resolving/rejecting
                reason.then(resolve, reject);
              } else {
                // Resolve with the returned value
                resolve(reason);
              }
            } else {
              // Double it and give it to the next person
              reject(this.reason as TReject);
            }
          } catch (error) {
            reject(error);
          }

          break;
        }
      }
    })
  }

  /**
   * Error-catching version of then()
   * @param onRejected Function to call on rejection
   * @returns Result of then(undefined, onRejected)
   */
  public catch<TReject = never>(
    onRejected? : (reason? : any) => TReject | PromisePolyfill<TReject>
  ) : PromisePolyfill<T | TReject> {
    return this.then(undefined, onRejected);
  }

  /**
   * Makes a new promise that immediately resolves
   * @param value Value to resolve with
   * @returns New promise that resolves
   */
  public static resolve<T>(value? : T | PromisePolyfill<T>) : PromisePolyfill<T> {
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
};