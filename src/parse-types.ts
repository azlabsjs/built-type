import { getObjectProperty } from '@azlabsjs/js-object';
import { TypeAny } from './base';
import { createPropMapFunc } from './helpers';
import {
  ParseValueResultType,
  SafeParseReturnType,
  UnknownType,
  _AbstractType,
} from './types';

/**
 * @internal
 *
 * Type value parsing instance class
 *
 */
export class TypeParseResult<TData, TError = unknown>
  implements ParseValueResultType<TData, TError>
{
  /**
   * Returns the parse result errors if any
   */
  get errors() {
    return this._errors;
  }

  /**
   * Returns the data compiled data of the parsing result data
   */
  get data() {
    return this._data;
  }

  /**
   * Checks if the non built-in type parse failed
   */
  get fails() {
    return this._hasErrors;
  }

  get aborted() {
    return this._aborted;
  }

  constructor(
    private _data: TData,
    private _hasErrors: boolean,
    private _errors?: TError,
    private _aborted: boolean = false
  ) {}
}

/**
 * @internal
 *
 * Creates a function that parses javascript array
 */
export function createParseArray<T>(t: _AbstractType<T>) {
  return (items: unknown[]) => {
    const output: T[] = [];
    const _errors: { [k: string]: unknown } = {} as UnknownType;
    let hasErrors = false;
    let index = 0;
    (items ?? []).forEach((item: UnknownType) => {
      const result = t.safeParse(item);
      if (result.success && result.data) {
        output.push(result.data as T);
      } else {
        hasErrors = true;
        _errors[`*.${index}`] = result.errors;
      }
      index += 1;
    });
    return new TypeParseResult(
      output,
      hasErrors,
      hasErrors ? _errors : undefined,
      false
    );
  };
}

/**
 * @internal
 *
 * Creates a function that parses a complex user defined object
 */
export function createParseObject<T = object>(
  createProp: ReturnType<typeof createPropMapFunc>,
  tParseFn: (_type: TypeAny, value: unknown) => SafeParseReturnType<T>,
  root = 'root$'
) {
  return (value: UnknownType) => {
    // TODO: Handle async parsing
    const propMap = createProp();
    const _instance = new Object() as UnknownType;
    const _errors: { [k: string]: unknown } = {} as UnknownType;
    let hasErrors = false;
    for (const prop of propMap) {
      const result = tParseFn(
        prop._type,
        getObjectProperty(value, prop.inputKey)
      );
      if (result.success) {
        _instance[prop.outputKey] = result.data;
      } else {
        hasErrors = true;
        _errors[`${root}.${prop.inputKey}`] = result.errors;
      }
    }
    return new TypeParseResult(
      _instance as T,
      hasErrors,
      hasErrors ? _errors : undefined,
      false
    );
  };
}

/**
 * @internal
 *
 * Creates a function that parses a javascript map
 */
export function createParseMap<TKey, TValue>(
  _key: _AbstractType<TKey>,
  _value: _AbstractType<TValue>
) {
  return (items: Map<UnknownType, UnknownType>) => {
    const _instance: Map<TKey, TValue> = new Map();
    const _errors = new Map<UnknownType, unknown>();
    let hasErrors = false;
    // We first check if items variable is define before
    // setting map values
    if (items) {
      items.forEach((item, k) => {
        const __key = _key.safeParse(k);
        const __value = _value.safeParse(item);
        if (__key.success && __key.data && __value.success && __value.data) {
          _instance.set(__key.data, __value.data);
        } else {
          hasErrors = true;
          _errors.set(k, [__key.errors, __value.errors]);
        }
      });
    }
    return new TypeParseResult(
      _instance,
      hasErrors,
      hasErrors ? _errors : undefined,
      false
    );
  };
}

/**
 * @internal
 *
 * Creates a function that parses a javascript set to user defined
 * Set type
 */
export function createParseSet<TValue>(t: _AbstractType<TValue>) {
  return (items: Set<UnknownType>) => {
    const _instance: Set<TValue> = new Set();
    const _errors: { [k: string]: unknown } = {} as UnknownType;
    let hasErrors = false;
    let index = 0;
    // Checks if the input set is defines before proceeding
    if (items) {
      items.forEach((item: UnknownType) => {
        const result = t.safeParse(item);
        if (result.success) {
          _instance.add(result.data as TValue);
        } else {
          hasErrors = true;
          _errors[`*.${index}`] = result.errors;
        }
        index += 1;
      });
    }
    return new TypeParseResult(
      _instance,
      hasErrors,
      hasErrors ? _errors : undefined,
      false
    );
  };
}
