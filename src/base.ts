import { ParseError } from './errors';
import { SafeParseReturnType, TypeDef } from './types';

/**
 * @internal
 */
export type TypeAny = Type<any, any, any>;

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
export type TypeOf<T extends Type<unknown, any, unknown>> = T['_output'];

/**
 * Export the Typeof type operator as `infer`
 */
export type { TypeOf as infer };

/**
 * @internal
 * 
 * Built type base class the provide type parsing and construction
 */
export class Type<TOutput = any, Def extends TypeDef = TypeDef, TInput = any> {
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
    const self = (this as any).constructor as new (...args: any) => Type;
    return new self({
      ...this._def,
      description,
    });
  }
}
