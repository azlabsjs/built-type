/**
 * A constraint is a set of rules that can be applied to a given type
 * to insure that runtime code execute safely
 */
export interface ConstraintInterface {
  /**
   * Constraint validation errrors
   */
  errors: unknown;

  /**
   * Constraint expected type
   */
  expectType: string | ((value: any) => boolean);

  /**
   * Constraint the variable to support null type
   */
  nullable(): ConstraintInterface;

  /**
   * Constraint the variable to support null and undefined types
   */
  nullish(): ConstraintInterface;

  /**
   * Check if the constraint fails on the variable. Constraints
   * will be in failure state if any of the validation function fails
   *
   * **Usage**
   *
   * ```ts
   * let constraint = (new NumberConstraint).min(10).max(30);
   *
   * // Applying the constraint to a given value
   * constraint.apply(15); // constraint.fails() === false
   * constraint.apply(45); // constraint.fails() === true
   * ```
   */
  fails(): boolean;

  /**
   * Call the constraint on user provided value
   */
  apply(value: any): ConstraintInterface;
}

/**
 * @type
 *
 * Built type definition
 */
export type TypeDef<
  TContraint extends ConstraintInterface = ConstraintInterface
> = {
  description?: string;
  coerce?: (value: any) => any;
  constraint: TContraint;
};

/**
 * @type
 * Partial built type definition
 */
export type PartrialTypeDef<
  TContraint extends ConstraintInterface = ConstraintInterface
> = {
  description?: string;
  coerce?: boolean;
  constraint?: TContraint;
};

/**
 * @type
 * Return type of the type safe parse method
 */
export type SafeParseReturnType<T> = {
  errors: any;
  success: boolean;
  data?: T | null;
};

/**
 * @internal
 */
export type RawShapeType = { [k: string]: _AbstractType<any, any, any> };

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
 * export type Person = infer<typeof person>;
 * ```
 */
export type TypeOf<T extends _AbstractType<unknown, any, unknown>> =
  T['_output'];

/**
 * Export the Typeof type operator as `infer`
 */
export type { TypeOf as infer };

/**
 * Parse value result type declaration
 */
export type ParseValueResultType<T = unknown, TError = unknown> = {
  /**
   * Returns the parse result errors if any
   */
  errors?: TError;
  /**
   * Returns the data compiled data of the parsing result data
   */
  data: T;

  /**
   * Checks if the non built-in type parse failed
   */
  fails: boolean;

  /**
   * Checks if the parse operation was aborted
   */
  aborted: boolean;
};

/**
 * @internal
 *
 * Generic type builder type declaration
 */
export interface _AbstractType<
  TOutput,
  Def extends TypeDef = TypeDef,
  TInput = TOutput
> {
  _type: TOutput;
  _output: TOutput;
  _input: TInput;
  _def: Def;

  /**
   * Copy the current object updating type definition and the parse function.
   */
  copy(
    def: PartrialTypeDef,
    _parseFn?: (value: any) => ParseValueResultType<TOutput>
  ): _AbstractType<TOutput, Def, TInput>;

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
  parse<T>(value: T | TInput): TOutput;

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
   *  // TODO: interact with the parse result
   * }
   * ```
   */
  safeParse<T>(value: T | TInput): SafeParseReturnType<TOutput>;

  /**
   * `isOptional` returns boolean value indicating whether the
   * type support optional values
   */
  isOptional(): boolean;

  /**
   * `isOptional` returns boolean value indicating whether the
   * type support null values
   */
  isNullable(): boolean;

  /**
   * Add a nil `undefined|null` constraint to the type builder instance
   */
  nullable(): _AbstractType<TOutput | null, Def, TInput>;

  /**
   * Add a nullable `null` constraint to the type builder instance
   */
  nullish(): _AbstractType<TOutput | null | undefined, Def, TInput>;

  /**
   * Describe the built-type
   */
  describe(description: string): _AbstractType<TOutput, Def, TInput>;
}

/**
 * @internal
 *
 * Object type builder type declaration
 */
export type _ObjectType<T extends RawShapeType> = _AbstractType<
  {
    [Prop in keyof T]: TypeOf<T[Prop]>;
  },
  TypeDef<ConstraintInterface>
> & {
  /**
   * TODO: Provide a better implementation to detect the reverseType instance type
   *
   * The reverse type of the current object
   */
  reverseType: _AbstractType<Record<string, any>, any, T>;
};

/**
 * Exported generic type builder type declaration
 */
export type AbstractType<
  TOutput,
  TDef extends TypeDef = TypeDef,
  TInput = TOutput
> = _AbstractType<TOutput, TDef, TInput>;

/**
 * Exported object builder type declaration
 */
export type ObjectType<T extends RawShapeType> = _ObjectType<T>;
