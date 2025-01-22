export function isPromise(value: any): value is Promise<any> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function' && typeof value.catch === 'function';
}

export function isAbortablePromise(value: any): value is AbortablePromise<any> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function' && typeof value.catch === 'function' && typeof value.abort === 'function';
}

export function isCancelablePromise(value: any): value is CancelablePromise<any> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function' && typeof value.catch === 'function' && typeof value.cancel === 'function';
}
