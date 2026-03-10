export function isPromise(value: any): value is Promise<any> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function' && typeof value.catch === 'function';
}

export function isAbortablePromise(value: any): value is AbortablePromise<any> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function' && typeof value.catch === 'function' && typeof value.abort === 'function';
}

export function promiseWithResolvers<T>() {
  let done!: (v: T) => void;
  let fail!: (err: any) => void;
  const deferred = new Promise<T>((resolve, reject) => {
    done = resolve;
    fail = reject;
  });
  return {
    promise: deferred,
    resolve: done,
    reject: fail,
  };
}

/**
 * 传入一个返回值为 promise 的函数 a，返回一个新函数 b
 * b 函数的返回值为 AbortablePromise<T>
 * 当调用 abort 方法时，会直接进入 reject 状态
 */
export function createAbortablePromise<T extends (...args: any[]) => Promise<any>, Res = UnwrapPromise<ReturnType<T>>>(promiseFn: T) {
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

/**
 * 传入一个返回值为 promise 的函数 a，返回一个新函数 b。
 * b 该函数在任何时候最多只有一个未完成的 promise 实例。
 * 既: 当调用 b 函数时，会返回一个 promise 如果在 promise 状态为 pending 期间再次调用 b 函数，则会取消上一次调用(如果支持取消)。
 * 在 pending 期间，无论调用新函数多少次，都只有最后一次 then 或 catch 会被调用。
 * 示例:
 * const fn = createSingleCallPromise(foo);
 * fn().then(() => console.log('1'));
 * fn().then(() => console.log('2'));
 * fn().then(() => console.log('3'));
 * 只输出一次: 3
 */
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

      const innerPormise = promiseFn(...args);

      currentPromise = innerPormise;

      if (!isPromise(innerPormise)) {
        resolve(innerPormise);
        runningId = null;
        currentPromise = null;
        return;
      }

      innerPormise
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
