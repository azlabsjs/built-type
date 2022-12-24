import { _Type } from './base';
import { createPropMapFunc } from './helpers';

/**
 * @internal
 *
 * Creates a function that parses javascript array
 */
export function createParseArray<T>(t: _Type<T>) {
  // TODO: Handle async parsing
  return (value: unknown[]) => value.map((item: unknown) => t.parse(item));
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
  _key: _Type<TKey>,
  _value: _Type<TValue>
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
export function createParseSet<TValue>(_value: _Type<TValue>) {
  return (value: Set<any>) => {
    const instance: Set<TValue> = new Set();
    for (const item of value) {
      instance.add(_value.parse(item));
    }
    return instance;
  };
}
