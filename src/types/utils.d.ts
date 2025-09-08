declare global {

  type FirstLetterUppercase<T extends string> = T extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : T;

  type FirstLetterLowercase<T extends string> = T extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}` : T;

  type IsLowerCase<T extends string> = T extends Lowercase<T> ? true : false;

  type IsUpperCase<T extends string> = T extends Uppercase<T> ? true : false;

  type IsFirstLetterUppercase<T extends string> = T extends `${Uppercase<string>}${string}` ? true : false;
  // type IsFirstLetterUppercase<T extends string> = T extends `${infer First}${string}` ? First extends Uppercase<First> ? true : false : false

  type IsFirstLetterLowercase<T extends string> = T extends `${Lowercase<string>}${string}` ? true : false;
  // type IsFirstLetterLowercase<T extends string> = T extends `${infer First}${string}` ? First extends Lowercase<First> ? true : false : false

  type IsStartWith<T extends string, Prefix extends string> = T extends `${Prefix}${string}` ? true : false;

  /**
   * 检查是否为小驼峰命名的事件名
   * onClick => true
   * onclick => false
   * OnClicK => false
   * onMouseEnter => true
   */
  type IsCamelCaseEventName<
    T extends string,
    Prefix extends string = 'on',
  > = T extends `${Prefix}${infer EventName}`
    ? EventName extends Capitalize<EventName>
      ? true
      : false
    : false;

  /**
   * 检查是否为 kebab-case 命名的事件名
   * on-click => true
   */
  type IsKebabCaseEventName<
    T extends string,
    Prefix extends string = 'on',
  > = T extends `${Prefix}-${infer EventName}`
    ? EventName extends Lowercase<EventName>
      ? true
      : false
    : false;

  type IsEventName<
    T extends string,
    Prefix extends string = 'on',
  > = IsCamelCaseEventName<T, Prefix> extends true
    ? true
    : IsKebabCaseEventName<T, Prefix> extends true
      ? true
      : false;

  /**
   * 提取事件名
   * onClick => click
   * on-click => click
   * onclick => never
   */
  type ExtractEventName<T extends string, Prefix extends string = 'on'>
    = T extends `${Prefix}-${infer EventName}`
      ? FirstLetterLowercase<EventName>
      : T extends `${Prefix}${infer EventName}`
        ? EventName extends Capitalize<EventName>
          ? FirstLetterLowercase<EventName>
          : never
        : never;

  interface AbortablePromise<T> extends Promise<T> {
    abort: (reason?: any) => void
  }

  type ConvertToAbortable<T> = T extends (...args: any[]) => Promise<infer R>
    ? (...args: Parameters<T>) => AbortablePromise<R>
    : T;

  type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

  type IsEqual<T, U> = [T] extends [U] ? [U] extends [T] ? true : false : false;

  /**
   * 提取所有以 'on' 开头的方法
   */
  type ExtractEvents<T, Prefix extends string = 'on', RT = Required<T>> = {
    [K in keyof RT as K extends string
      ? IsEventName<K, Prefix> extends true
        ? RT[K] extends (...args: any[]) => any
          ? K
          : never
        : never
      : never]: RT[K];
  };

  /**
   * 提取所有以 'on' 开头的方法并转换为 defineEmits 需要的格式
   * Vue 3.3+
   */
  type TransformToVueEmitTypes<T, Prefix extends string = 'on', RT = Required<T>> = {
    [K in keyof RT as K extends `${Prefix}${string}`
      ? RT[K] extends (...args: any[]) => any
        ? K extends `${Prefix}-${infer EventName}`
          ? FirstLetterLowercase<EventName>
          : K extends `${Prefix}${infer EventName}`
            ? EventName extends Capitalize<string>
              ? FirstLetterLowercase<EventName>
              : never
            : never
        : never
      : never]: RT[K] extends (...args: infer Args) => any ? [...Args] : never;
  };

  // todo 如何实现签名重载
  type TransformToVueEmitTypes2<T, Prefix extends string = 'on', RT = Required<T>> = {
    [K in keyof RT as K extends `${Prefix}${string}`
      ? RT[K] extends (...args: infer Args) => any
        ? K extends `${Prefix}-${infer EventName}`
          ? FirstLetterLowercase<EventName>
          : K extends `${Prefix}${infer EventName}`
            ? EventName extends Capitalize<string>
              ? FirstLetterLowercase<EventName>
              : never
            : never
        : never
      : never]: (e: K extends `${Prefix}-${infer EventName}`
      ? FirstLetterLowercase<EventName>
      : K extends `${Prefix}${infer EventName}`
        ? EventName extends Capitalize<string>
          ? FirstLetterLowercase<EventName>
          : EventName
        : never, ...args: Parameters<RT[K]>) => void;
  };

  /**
   * 获取对象中所有满足类型的 key
   * type keys = KeysOfType<{ name: string, age: number, address: string }, string> // "name" | "address"
   */
  type KeysOfType<T extends object, KeyType> = {
    [K in keyof T]-?: T[K] extends KeyType ? K : never
  }[keyof T];

  /**
   * KeysOfType 的精确版
   * type keys = KeysOfType<{ name: string, age: number, address: string, xx: string | number }, string | number>; // "name" | "age" | "address" | "xx"
   * type keys = KeysOfExactType<{ name: string, age: number, address: string, xx: string | number }, string | number>; // "xx"
   */
  type KeysOfExactType<T extends object, KeyType> = {
    [K in keyof T]-?: [T[K]] extends [KeyType]
      ? ([KeyType] extends [T[K]] ? K : never)
      : never
  }[keyof T];

  /**
   * 获取对象中 key 的类型
   * type types = ValueOf<{ name: string, age: number, address: string }> // string | number
   */
  type ValueOf<T> = T[keyof T];

}

export { };
