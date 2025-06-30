import { ParseError } from './errors';
import { TypeParseResult } from './parse-types';
import {
  PartrialTypeDef,
  SafeParseReturnType,
  TypeDef,
  UnknownType,
  _AbstractType,
} from './types';

/**
 * @internal
 */
export type TypeAny = _AbstractType<UnknownType, UnknownType, UnknownType>;

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
export class _Type<
  TOutput = UnknownType,
  Def extends TypeDef = TypeDef,
  TInput = TOutput,
> implements _AbstractType<TOutput, Def, TInput>
{
  readonly _type!: TOutput;
  readonly _output!: TOutput;
  readonly _input!: TInput;
  readonly _def!: Def;
  readonly _parseFn!: (value: unknown) => TypeParseResult<TOutput>;
  private _reverseType?: _AbstractType<TInput, Def, TOutput>;
  // The reverse type factory allow to provide a deferred reverse built-type implementation
  private _reverseTypeFactory!:
    | (() => _AbstractType<TInput, Def, TOutput>)
    | undefined;

  get description() {
    return this._def.description;
  }

  get reverseType(): _AbstractType<TInput, Def, TOutput> | undefined {
    if (!this._reverseType) {
      this._reverseType = this._reverseTypeFactory
        ? this._reverseTypeFactory()
        : undefined;
    }
    return this._reverseType;
  }

  constructor(
    def: Def,
    _parseFn?: (value: unknown) => TypeParseResult<TOutput>,
    _reverseTypeFactory?: () => _AbstractType<TInput, Def, TOutput>
  ) {
    if (def) {
      this._def = def;
    }
    this._parseFn =
      _parseFn ??
      ((value: unknown) => new TypeParseResult(value as TOutput, false));
    this._reverseTypeFactory = _reverseTypeFactory;
  }

  /**
   * Copy the current object updating type definition and the parse function.
   */
  copy(
    def: PartrialTypeDef,
    _parseFn?: (value: unknown) => TypeParseResult<TOutput>
  ) {
    const self = this.constructor;
    return self({ ...this._def, ...def }, _parseFn ?? this._parseFn);
  }

  /**
   * Parse user provided value using the built-type.
   * It throws a `ParseError` error instance if the parsing fails.
   *
   * ```ts
   * const type = new BuiltType._object({ ... })
   *
   * // parsing a value using the type built type
   * const result = type.parse({ ... }); // throws `ParseError`
   *
   * ```
   */
  parse<T>(value: T | TInput): TOutput {
    const result = this.safeParse(value as unknown as TInput);
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

  /**
   * Parse user provided value using the built-type.
   *
   * ```ts
   * const type = new BuiltType._object({ ... })
   *
   * // parsing a value using the type built type
   * const result = type.safeParse({ ... }); // `SafeParseReturnType`
   *
   * if (result.success) {
   *  console.log(result.data);
   * }
   * ```
   */
  safeParse<T>(value: T | TInput): SafeParseReturnType<TOutput> {
    if (this._def.coerce) {
      value = this._def.coerce(value);
    }
    const constraint = this._def.constraint.apply(value);
    const result = !constraint.fails()
      ? this._safeParseNullish(value)
      : new TypeParseResult(undefined, true, constraint.errors, false);
    return result.fails
      ? {
          success: false,
          errors: result.errors,
        }
      : {
          success: true,
          errors: undefined,
          data: result.data,
        };
  }

  private _safeParseNullish(value: unknown) {
    return typeof value === 'undefined' || (value === null && this.isOptional())
      ? new TypeParseResult(value, false, undefined, false)
      : this._parseFn(value);
  }

  rawParse(value: TInput) {
    if (this._def.coerce) {
      value = this._def.coerce(value);
    }
    return this._parseFn(value);
  }

  /**
   * `isOptional` returns boolean value indicating whether the
   * type support optional values
   */
  isOptional(): boolean {
    return this.safeParse(undefined).success;
  }

  /**
   * `isOptional` returns boolean value indicating whether the
   * type support null values
   */
  isNullable(): boolean {
    return this.safeParse(null).success;
  }

  nullable() {
    this._def.constraint?.nullable();
    return this;
  }

  nullish() {
    this._def.constraint?.nullish();
    return this;
  }

  /**
   * Describe the built-type
   */
  describe(description: string) {
    const self = this.constructor as new (
      ...args: unknown[]
    ) => _Type<TOutput, Def, TInput>;
    return new self({
      ...this._def,
      description,
    });
  }
}

export const createType = <
  TOutput = UnknownType,
  Def extends TypeDef = TypeDef,
  TInput = UnknownType,
>(
  def: Def,
  _parseFn?: (value: UnknownType) => TypeParseResult<TOutput>,
  _reverseTypeFactory?: () => _AbstractType<TInput, Def, TOutput>
) => new _Type<TOutput, Def, TInput>(def, _parseFn, _reverseTypeFactory);
