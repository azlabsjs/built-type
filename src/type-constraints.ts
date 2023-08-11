import { ConstraintInterface } from './types';

/**
 * Base class for constraint that are applicable on built types.
 */
abstract class Constraint implements ConstraintInterface {
  protected _map: Map<
    string,
    { fn: (value: any) => boolean; message: string }
  > = new Map();

  protected _errors: string[] = [];

  private _null = false;

  private _undefined = false;

  get errors() {
    return this._errors;
  }

  abstract expectType: string | ((value: any) => boolean);

  nullable() {
    this._null = true;
    return this;
  }

  nullish() {
    this._undefined = true;
    return this;
  }

  fails() {
    return this._errors.length !== 0;
  }

  apply(value: any) {
    // Reset the errors array to reuse the constraint for a given value
    this._errors = [];
    // Case the value is null and the constraint allow null type
    // return this to wihtout applying any other constraint
    if (this._null === true && value === null) {
      return this;
    }
    if (
      this._undefined === true &&
      (value === null || typeof value === 'undefined')
    ) {
      return this;
    }
    const assertType =
      typeof this.expectType === 'string'
        ? (_value: any) => typeof _value === this.expectType
        : this.expectType;
    if (!assertType(value)) {
      this._errors.push(
        typeof this.expectType === 'string'
          ? `Value must be of type ${this.expectType}, ${typeof value} given`
          : `Unsupported type ${typeof value}`
      );
      return this;
    }
    for (const key of this._map.keys()) {
      const v = this._map.get(key);
      if (typeof v === 'undefined' || v === null) {
        continue;
      }
      if (v.fn(value) === false) {
        this._errors.push(v.message);
      }
    }
    return this;
  }
}

/**
 * Defines a string constraint class that can be applied to
 * built string types
 *
 * ```ts
 * import { StrConstraint } from '@azlabsjs/built-type';
 *
 * const constraint = (new StrConstraint)
 *                      .minLength(2)
 *                      .maxLength(10);
 *
 * // Invoke the constraint on a value
 * constraint.apply('Hello').fails(); // false
 * constraint.apply('Hello World! Welcome').fails(); // true
 * ```
 */
export class StrConstraint extends Constraint {
  get expectType() {
    return 'string';
  }

  minLength(len: number, message?: string) {
    this._map.set('min_len', {
      fn: (value: any) => value.length >= len,
      message:
        message ??
        `Expect length string length to be greater than or equal to ${len}`,
    });
    return this;
  }

  maxLength(len: number, message?: string) {
    this._map.set('max_len', {
      fn: (value: any) => value.length <= len,
      message:
        message ??
        `Expect length string length to be less than or equal to ${len}`,
    });
    return this;
  }

  pattern(regex: RegExp, message?: string) {
    this._map.set('pattern', {
      fn: (value: any) => regex.test(value),
      message:
        message ??
        `Expect the string to match the corresponding pattern ${regex.source}`,
    });
    return this;
  }

  startsWith(needle: string, message?: string) {
    this._map.set('starts_with', {
      fn: (value: any) => value.startsWith(needle),
      message: message ?? `Expect string value to starts with ${needle}`,
    });
    return this;
  }

  endsWith(needle: string, message?: string) {
    this._map.set('ends_with', {
      fn: (value: any) => value.endsWith(needle),
      message: message ?? `Expect string value to ends with ${needle}`,
    });
    return this;
  }

  length(len: number, message?: string) {
    this._map.set('len', {
      fn: (value: string) => value.length === len,
      message:
        message ?? `Expect computed length of the string to equal ${len}`,
    });
    return this;
  }

  notEmpty(message?: string) {
    this._map.set('ends_with', {
      fn: (value: string) =>
        typeof value !== 'undefined' &&
        typeof value === 'string' &&
        value.trim() !== '',
      message: message ?? `Attribute must not be empty`,
    });
  }

  override apply(value: any) {
    return super.apply(value);
  }
}

/**
 * Defines a number constraint class that can be applied to
 * built number types
 *
 * ```ts
 * import { NumberConstraint } from '@azlabsjs/built-type';
 *
 * const constraint = (new NumberConstraint)
 *                      .min(2);
 *
 * // Invoke the constraint on a value
 * constraint.apply(3).fails(); // false
 * constraint.apply(1).fails(); // true
 * ```
 */
export class NumberConstraint extends Constraint {
  expectType = 'number';

  min(min: number, message?: string) {
    this._map.set('min', {
      fn: (value: any) => value >= min,
      message:
        message ?? `Expect the value to be greater than or equal to ${min}`,
    });
    return this;
  }

  max(min: number, message?: string) {
    this._map.set('max', {
      fn: (value: any) => value <= min,
      message: message ?? `Expect the value to be less than or equal to ${min}`,
    });
    return this;
  }

  positive(message?: string) {
    this._map.set('positive', {
      fn: (value: any) => Math.min(0, value) !== 0,
      message: message ?? `Expect the value to be a positive integer`,
    });
    return this;
  }

  negative(message?: string) {
    this._map.set('negative', {
      fn: (value: any) => Math.max(0, value) === 0,
      message: message ?? `Expect the value to be a negative integer`,
    });
    return this;
  }

  int(message?: string) {
    this._map.set('int', {
      fn: (value: any) => {
        return Number.isSafeInteger(value);
      },
      message: message ?? `Expect the value to be an integer value`,
    });
    return this;
  }

  float(message?: string) {
    this._map.set('float', {
      fn: (value: any) => typeof value === 'number' && !Number.isInteger(value),
      message: message ?? `Expect the value to be an integer value`,
    });
    return this;
  }

  finite(message?: string) {
    this._map.set('finite', {
      fn: (value: any) => Number.isFinite(value),
      message: message ?? `Expect the value to be an integer value`,
    });
    return this;
  }

  between(min: number, max: number, message?: string) {
    this._map.set('between', {
      fn: (value: any) => min <= value && max >= value,
      message:
        message ??
        `Expect the value be less than or equal to ${max} and greater than or equal to ${min}`,
    });
    return this;
  }
}

/**
 * Defines a boolean constraint class that can be applied to
 * built boolean types
 *
 *
 * ```ts
 * import { BoolConstraint } from '@azlabsjs/built-type';
 *
 * const constraint = (new BoolConstraint);
 *
 * // Invoke the constraint on a value
 * constraint.apply(true).fails(); // false
 * constraint.apply('Hello').fails(); // true
 * ```
 */
export class BoolConstraint extends Constraint {
  expectType = 'boolean';
}

/**
 * Defines a symbol constraint class that can be applied to
 * built symbol types
 */
export class SymbolConstraint extends Constraint {
  expectType = 'symbol';
}

/**
 * Defines a date constraint class that can be applied to
 * built date types
 *
 * ```ts
 * import { DateContraint } from '@azlabsjs/built-type';
 *
 * const constraint = (new DateContraint).max(new Date());
 *
 * // Invoke the constraint on a value
 * constraint.apply(new Date('2021-11-10')).fails();
 * ```
 */
export class DateContraint extends Constraint {
  // TODO : Add JSDate.isValid()
  expectType = (_value: any) =>
    _value instanceof Date ||
    (typeof _value === 'object' &&
      Object.prototype.toString.call(_value) === '[object Date]');

  private readonly _createDateFunc!: (value: any) => Date;

  constructor(createDateFunc?: (value: any) => Date) {
    super();
    this._createDateFunc =
      createDateFunc ?? ((_value: string | number | Date) => new Date(_value));
  }

  // TODO: Add JSDate method after, before, etc... for validation
  min(min: number | Date, message?: string) {
    this._map.set('min_date', {
      fn: (value: any) =>
        (value instanceof Date
          ? value
          : this._createDateFunc(value)
        ).getTime() >= (typeof min === 'number' ? min : min.getTime()),
      message:
        message ??
        `Expects date to be after ${
          typeof min === 'number'
            ? new Date(min).toLocaleString()
            : min.toLocaleDateString()
        }`,
    });
    return this;
  }

  max(max: number | Date, message?: string) {
    this._map.set('max_date', {
      fn: (value: any) =>
        (value instanceof Date
          ? value
          : this._createDateFunc(value)
        ).getTime() >= (typeof max === 'number' ? max : max.getTime()),
      message:
        message ??
        `Expects date to be before ${
          typeof max === 'number'
            ? new Date(max).toLocaleString()
            : max.toLocaleDateString()
        }`,
    });
    return this;
  }
}

/**
 * Defines an array constraint class that can be applied to
 * built array types
 *
 * ```ts
 * import { ArrayConstraint } from '@azlabsjs/built-type';
 *
 * const constraint = (new ArrayConstraint).nonempty();
 *
 * // Invoke the constraint on a value
 * constraint.apply([]).fails(); // true
 *
 * const constraint2 = (new ArrayConstraint).min(2);
 *
 * // Invoke the constraint on a value
 * constraint.apply([2]).fails(); // true
 * constraint.apply([2, 4, 5]).fails(); // false
 * ```
 */
export class ArrayConstraint extends Constraint {
  expectType = (_value: any) => Array.isArray(_value);

  min(len: number, message?: string) {
    this._map.set('min', {
      fn: (value: any) => (value ?? []).length >= len,
      message:
        message ??
        `Expects the array length to contains at least ${len} element`,
    });
    return this;
  }

  max(len: number, message?: string) {
    this._map.set('max', {
      fn: (value: any) => (value ?? []).length <= len,
      message:
        message ??
        `Expects the array length to contains at most ${len} element`,
    });
    return this;
  }

  length(len: number, message?: string) {
    this._map.set('length', {
      fn: (value: any) => value.length === len,
      message: message ?? `Expects the array length to equal ${len}`,
    });
    return this;
  }

  nonempty(message?: string) {
    this._map.set('nonempty', {
      fn: (value: any) => (value ?? []).length !== 0,
      message: message ?? `Expects the array to not be empty`,
    });
    return this;
  }
}

/**
 * Defines an object constraint class that can be applied to
 * built object types
 */
export class ObjectConstraint extends Constraint {
  expectType = (value: any) => {
    if (typeof value !== 'object') {
      return false;
    }
    // TODO: Provide an implementation that make more checks
    return true;
  };

  required(keys: string | string[], message?: string) {
    const _keys = typeof keys === 'string' ? [keys] : keys;
    const missingKeys: string[] = [];
    this._map.set('required', {
      fn: (value: any) => {
        for (const key of _keys) {
          if (!(key in (value as object))) {
            missingKeys.push(key);
            continue;
          }
        }
        return missingKeys.length === 0;
      },
      message: message ?? `Missing object properties ${missingKeys.join(', ')}`,
    });
    return this;
  }

  // ofType<T>(key: string, type_: 'number' | 'symbol' | 'string' | 'object' | (new() => any), message?: string) {
  //     this._map.set('required', {
  //         fn: (value: any) => {
  //             if (['number', 'symbol', 'string', 'object'].indexOf(type_ as string) !== -1) {
  //                 return typeof value === type_;
  //             }
  //             return value instanceof type_.constructor;
  //         },
  //         message: message ?? `Expect object key ${key} to be instance of ${String(type_)}`
  //     });
  //     return this;
  // }
}

/**
 * Defines a constraint that might be apply to any or unkown
 * built types
 */
export class NoConstraint extends Constraint {
  expectType = () => true;
}

/**
 * Defines a null and undefined constraint class that can be applied to
 * built null and undefined types
 *
 * ```ts
 * import { NullishConstraint } from '@azlabsjs/built-type';
 *
 * const constraint = (new NullishConstraint);
 *
 * // Invoke the constraint on a value
 * constraint.apply(null).fails(); // false
 * constraint.apply(undefined).fails(); // false
 * constraint.apply(34).fails(); // true
 * ```
 */
export class NullishConstraint extends Constraint {
  expectType = (_value: any) =>
    typeof _value === 'undefined' || _value === null;
}

/**
 * Defines a null constraint class that can be applied to
 * built null types
 *
 * ```ts
 * import { NullConstraint } from '@azlabsjs/built-type';
 *
 * const constraint = (new NullConstraint);
 *
 * // Invoke the constraint on a value
 * constraint.apply(null).fails(); // false
 * constraint.apply(34).fails(); // true
 * ```
 */
export class NullConstraint extends Constraint {
  expectType = (value: any) => value === null;
}

/**
 * Defines a map instance constraint class that can be applied to
 * built map types
 */
export class MapConstraint extends Constraint {
  expectType = (value: any) => {
    if (value instanceof Map) {
      return true;
    }
    if (
      value &&
      typeof value.clear === 'function' &&
      typeof value.delete === 'function' &&
      typeof value.get === 'function' &&
      typeof value.has === 'function' &&
      typeof value.set === 'function'
    ) {
      return true;
    }
    return false;
  };
}

/**
 * Defines a set instance constraint class that can be applied to
 * built set types
 *
 * ```ts
 * import { SetConstraint } from '@azlabsjs/built-type';
 *
 * const constraint = (new SetConstraint).nonempty();
 *
 * // Invoke the constraint on a value
 * constraint.apply(new Set()).fails(); // true
 *
 * const constraint2 = (new ArrayConstraint).min(2);
 *
 * // Invoke the constraint on a value
 * constraint.apply(new Set([2])).fails(); // true
 * constraint.apply(new Set([2, 4, 5])).fails(); // false
 * ```
 */
export class SetConstraint extends Constraint {
  expectType = (value: any) => {
    if (value instanceof Set) {
      return true;
    }
    if (
      value &&
      typeof value.add === 'function' &&
      typeof value.clear === 'function' &&
      typeof value.delete === 'function' &&
      typeof value.has === 'function'
    ) {
      return true;
    }
    return false;
  };

  min(len: number, message?: string) {
    this._map.set('min', {
      fn: (value: any) => (value as Set<unknown>)?.size >= len,
      message: message ?? `Expects set to be greater ${len}`,
    });
    return this;
  }

  max(len: number, message?: string) {
    this._map.set('max', {
      fn: (value: any) => (value as Set<unknown>)?.size <= len,
      message: message ?? `Expects set size be less than ${len}`,
    });
    return this;
  }

  nonempty(message?: string) {
    this._map.set('nonempty', {
      fn: (value: any) => (value as Set<unknown>)?.size !== 0,
      message: message ?? `Expects set to not be empty`,
    });
    return this;
  }
}
