import { Type } from './base';
import { createPropMapFunc } from './helpers';

/**
 * @internal
 */
export const parseNumber = (value: any) => value as number;
/**
 * @internal
 */
export const parseString = (value: any) => value as string;
/**
 * @internal
 */
export const parseDate = (value: any) => value as Date;
/**
 * @internal
 */
export const parseBool = (value: any) => value as boolean;
/**
 * @internal
 */
export const parseSymbol = (value: any) => value as symbol;

/**
 * @internal
 *
 * Creates a function that parses javascript array
 */
export function parseArray<T>(t: Type<T>) {
  // TODO: Handle async parsing
  return (value: any[]) => {
    return value.map((item: any) => t.parse(item));
  };
}

/**
 * @internal
 *
 * Creates a function that parses a complex user defined object
 */
export function createParseObject<T>(
  createProp: ReturnType<typeof createPropMapFunc>,
  instance: T
) {
  return (value: any) => {
    // TODO: Handle async parsing
    const propMap = createProp();
    const _instance = instance as any;
    for (const prop of propMap) {
      if (prop.inputKey in value) {
        _instance[prop.outputKey] = prop._type.parse(value[prop.inputKey]);
      }
    }
    return _instance as T;
  };
}

/**
 * @internal
 *
 * Creates a function that parses a javascript map
 */
export function createParseMap<TKey, TValue>(
  _key: Type<TKey>,
  _value: Type<TValue>
) {
  return (value: Map<any, any>) => {
    const instance: Map<TKey, TValue> = new Map();
    for (const [k, v] of value) {
      instance.set(_key.parse(k), _value.parse(v));
    }
    return instance;
  };
}

/**
 * @internal
 *
 * Creates a function that parses a javascript set to user defined
 * Set type
 */
export function createParseSet<TValue>(_value: Type<TValue>) {
  return (value: Set<any>) => {
    const instance: Set<TValue> = new Set();
    for (const item of value) {
      instance.add(_value.parse(item));
    }
    return instance;
  };
}
