declare global {

  type FirstLetterUppercase<T extends string> = T extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : T;

}

export { };
