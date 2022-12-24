import { ParseError } from './errors';
import { SafeParseReturnType, TypeDef } from './types';

/**
 * @internal
 */
export type TypeAny = _Type<any, any, any>;

/**
 * @interna
 */
export type RawShapeType = { [k: string]: TypeAny };

/**
 * TypeOf operator allows developper to get the compile time type information
 * of a built object
 *
 * ```ts
 * import {infer, BuiltType} from '@azlabsjs/built-type';
 *
 * const person = BuiltType.object({
 *    firstname: BuiltType.str(),
 *    lastname: BuiltType.str()
 * });
 *
 * export type Person = infer(person);
 * ```
 */
export type TypeOf<T extends _Type<unknown, any, unknown>> = T['_output'];

/**
 * Export the Typeof type operator as `infer`
 */
export type { TypeOf as infer };

/**
 * @internal
 *
 * Built type base class the provide type parsing and construction.
 *
 * It allows developper to transform, construct and parse (safely) typescript values
 *
 * ```ts
 * // Creating type using Built Type class
 * import { BuiltType, SetConstraint } from '@azlabsjs/built-type';
 *
 * const set = BuiltType._set((new SetConstraint).nonempty());
 *
 * // To create a result from a set instance:
 * const result = set.parse(new Set([])); // Will fails and throws a ParseError as it does not conform the constraint
 * // Applied by the `nonempty()` of the set constraint
 *
 * const result2 = set.parse(new Set([1])); // Passes and create a Set<TValue> instance
 *
 * // Alternative to the `parse()` method, the type class support a `safeParse()` which allow the developper to take decision based on the state of value parsing
 *
 * const result = set.safeParse(new Set()); // return SafeParseReturnType<Set>
 * // result.success -> returns true if parsing was successful and false if not
 * if (result.success) {
 *    const data = result.data;
 * } else {
 *  // Interact with the parsing error to see the errors based on the parsing
 * }
 *
 * ```
 *
 * If require developper might wish to check if the type instance support null values
 *
 * ```ts
 * // Creating type using Built Type class
 * import { BuiltType, SetConstraint } from '@azlabsjs/built-type';
 *
 * const set = BuiltType._set((new SetConstraint).nonempty());
 *
 * // Check if the type supports null values
 * if (set.isNullable()) {
 *    // built type supports null values
 * }
 *
 * // Check if the type support undefined
 * if (set.isOptional()) {
 *    // built type supports null values
 * }
 *
 * // To describe the type
 * set.describe('my-set');
 *
 * ```
 *
 */
export class _Type<TOutput = any, Def extends TypeDef = TypeDef, TInput = any> {
  readonly _type!: TOutput;
  readonly _output!: TOutput;
  readonly _def!: Def;
  readonly _parseFn!: (value: any) => TOutput;

  get description() {
    return this._def.description;
  }

  constructor(def: Def, _parseFn?: (value: any) => TOutput) {
    if (def) {
      this._def = def;
    }
    this._parseFn = _parseFn ?? ((value: any) => value as TOutput);
  }

  parse(value: TInput) {
    const result = this.safeParse(value);
    if (!result.success) {
      throw new ParseError(
        result.errors,
        this._def.description
          ? `Failed parsing ${this._def.description} input`
          : undefined
      );
    }
    return result.data as TOutput;
  }

  safeParse(value: any): SafeParseReturnType<TOutput> {
    if (this._def.coerce) {
      value = this._def.coerce(value);
    }
    const constraint = this._def.constraint.apply(value);
    return {
      data: !constraint.fails() ? this._parseFn(value) : undefined,
      errors: constraint.errors,
      success: !constraint.fails(),
    };
  }

  isOptional(): boolean {
    return this.safeParse(undefined).success;
  }

  isNullable(): boolean {
    return this.safeParse(null).success;
  }

  describe(description: string) {
    const self = (this as any).constructor as new (...args: any) => _Type;
    return new self({
      ...this._def,
      description,
    });
  }
}

export const createType = <
  TOutput = any,
  Def extends TypeDef = TypeDef,
  TInput = any
>(
  def: Def,
  _parseFn?: (value: any) => TOutput
) => new _Type<TOutput, Def, TInput>(def, _parseFn);
