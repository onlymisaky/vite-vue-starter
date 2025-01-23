export function isPromise(value: any): value is Promise<any> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function' && typeof value.catch === 'function';
}

export function isAbortablePromise(value: any): value is AbortablePromise<any> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function' && typeof value.catch === 'function' && typeof value.abort === 'function';
}

export function createAbortablePromise<
  T extends (...args: any[]) => Promise<any>,
  Res = UnwrapPromise<ReturnType<T>>,
>(promiseFn: T) {
  if (typeof promiseFn !== 'function') {
    throw new TypeError('promiseFn must be a function');
  }

  return (...args: Parameters<T>) => {
    let abort = (_reason?: any) => { };
    const promise = new Promise<Res>((resolve, reject) => {
      try {
        const res = promiseFn(...args);
        if (isPromise(res)) {
          res.then(resolve).catch(reject);
          if (isAbortablePromise(res)) {
            abort = (reason?: any) => {
              reject(new Error(typeof reason === 'string' ? reason : 'abort'));
              res.abort(reason);
            };
            return;
          }
          abort = (reason: any) => {
            reject(new Error(typeof reason === 'string' ? reason : 'abort'));
          };
          return;
        }
        resolve(res);
      }
      catch (err) {
        reject(err);
      }
    }) as AbortablePromise<Res>;

    promise.abort = abort;
    return promise;
  };
}

export function createSingleCallPromise<T extends (...args: any[]) => Promise<any>>(promiseFn: T) {
  if (typeof promiseFn !== 'function') {
    throw new TypeError('promiseFn must be a function');
  }

  let currentId = 0;
  let runningId: number | null = null;
  let currentPromise: Promise<any> | null = null;

  return ((...args: Parameters<T>) => {
    const callId = ++currentId;

    if (currentPromise && isAbortablePromise(currentPromise)) {
      currentPromise.abort();
    }

    const promise = new Promise((resolve, reject) => {
      runningId = callId;

      const promise = promiseFn(...args);

      currentPromise = promise;

      if (!isPromise(promise)) {
        resolve(promise);
        runningId = null;
        currentPromise = null;
        return;
      }

      promise
        .then((result) => {
          if (callId === runningId) {
            resolve(result);
          }
        })
        .catch((error) => {
          if (callId === runningId) {
            reject(error);
          }
        })
        .finally(() => {
          if (callId === runningId) {
            runningId = null;
            currentPromise = null;
          }
        });
    });

    if (currentPromise && typeof currentPromise === 'object') {
      Object.keys(currentPromise).forEach((key) => {
        const value = (currentPromise as any)[key];
        if (typeof value === 'function') {
          (promise as any)[key] = value.bind(currentPromise);
        }
        else {
          (promise as any)[key] = value;
        }
      });
    }

    return promise;
  }) as T;
}
