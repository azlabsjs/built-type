import { createType, RawShapeType, TypeOf, _Type } from './base';
import { createPropMapFunc, mergeTypeDefRequiredParams } from './helpers';
import {
  createParseArray,
  createParseMap,
  createParseObject,
  createParseSet
} from './parse-types';
import {
  ArrayConstraint,
  BoolConstraint,
  DateContraint,
  MapConstraint,
  NoConstraint,
  NullConstraint,
  NullishConstraint,
  NumberConstraint,
  ObjectConstraint,
  SetConstraint,
  StrConstraint,
  SymbolConstraint
} from './type-constraints';
import { ConstraintInterface, PartrialTypeDef, TypeDef } from './types';

/**
 * BuiltType class provides developpers with factory methods for creating
 * compile time types that are used to parse value at runtime to prevents type errors
 * when running applications
 */
export class BuiltType {
  /**
   * Creates a built string type
   *
   * ```ts
   * import { BuiltType, Patterns } from '@azlabsjs/built-type';
   *
   * const name = BuiltType._str({ coerce: true });
   *
   * // Parsing a value
   * console.log(name.parse('azandrew-sidoine'));
   *
   * // To apply constraint to parsed values:
   *
   * const email = BuiltType._str({ constraint: (new StrConstraint).pattern(Patterns.email) });
   *
   * console.log(email.parse('test-value')); // Will normally fail and throws error
   * ```
   */
  static _str(
    def?: PartrialTypeDef<StrConstraint>
  ): _Type<string, TypeDef<ConstraintInterface>, unknown> {
    return createType<string>(
      mergeTypeDefRequiredParams(
        new StrConstraint(),
        def,
        def?.coerce
          ? (_value) =>
              typeof _value !== 'undefined' && _value !== null
                ? String(_value)
                : _value
          : undefined
      )
    );
  }

  /**
   * Creates a number type instance
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const name = BuiltType._num({ coerce: true });
   *
   * // To apply constraint to parsed values:
   *
   * // Apply a minim rule on the value that can be assigned to the value constructed
   * // using this factory method
   * const email = BuiltType._num({ constraint: (new NumberConstraint).min(5) });
   *
   * ```
   */
  static _num(
    def?: PartrialTypeDef<NumberConstraint>
  ): _Type<number, TypeDef<ConstraintInterface>, unknown> {
    return createType<number>(
      mergeTypeDefRequiredParams(
        new NumberConstraint(),
        def,
        def?.coerce
          ? (_value) =>
              typeof _value !== 'undefined' && _value !== null
                ? Number(_value)
                : _value
          : undefined
      )
    );
  }

  /**
   * Creates javascript/typescript boolean based type instance
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const bool = BuiltType._bool({ coerce: true });
   *
   * // To apply constraint to parsed values:
   *
   * // Constrained type instance
   * const value = BuiltType._bool({ constraint: new BoolConstraint });
   *
   * ```
   *
   */
  static _bool(
    def?: PartrialTypeDef<BoolConstraint>
  ): _Type<boolean, TypeDef<ConstraintInterface>, unknown> {
    return createType<boolean>(
      mergeTypeDefRequiredParams(
        new BoolConstraint(),
        def,
        def?.coerce
          ? (_value) =>
              typeof _value !== 'undefined' && _value !== null
                ? Boolean(_value)
                : _value
          : undefined
      )
    );
  }

  /**
   * Creates a javascript/typescript symbol based type instance
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const bool = BuiltType._symbol({ coerce: true });
   *
   * // To apply constraint to parsed values:
   *
   * // Constrained type instance
   * const value = BuiltType._symbol({ constraint: new SymbolConstraint });
   *
   * ```
   *
   */
  static _symbol(
    def?: PartrialTypeDef<SymbolConstraint>
  ): _Type<symbol, TypeDef<ConstraintInterface>, unknown> {
    return createType<symbol>(
      mergeTypeDefRequiredParams(
        new SymbolConstraint(),
        def,
        def?.coerce
          ? (_value) =>
              typeof _value !== 'undefined' && _value !== null
                ? Symbol(_value)
                : _value
          : undefined
      )
    );
  }

  /**
   * Creates a Date type instance
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const bool = BuiltType._date({ coerce: true });
   *
   * // To apply constraint to parsed values:
   *
   * // Constrained type instance
   * const value = BuiltType._date({ constraint: new DateContraint });
   *
   * ```
   *
   */
  static _date(
    def?: PartrialTypeDef<DateContraint>
  ): _Type<Date, TypeDef<ConstraintInterface>, unknown> {
    return createType<Date>(
      mergeTypeDefRequiredParams(
        new DateContraint(),
        def,
        def?.coerce
          ? (_value) =>
              typeof _value !== 'undefined' && _value !== null
                ? !(_value instanceof Date)
                  ? new Date(_value)
                  : _value
                : _value
          : undefined
      )
    );
  }

  /**
   * Creates an array type instance
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const bool = BuiltType._array({ coerce: true });
   *
   * // To apply constraint to parsed values:
   *
   * // Constrained type instance
   * const value = BuiltType._array({ constraint: (new ArrayConstraint).nonempty() });
   *
   * ```
   *
   */
  static _array<T>(
    type_: _Type<T>,
    def?: PartrialTypeDef<ArrayConstraint>
  ): _Type<T[], TypeDef<ConstraintInterface>, unknown[]> {
    return createType<T[]>(
      mergeTypeDefRequiredParams(new ArrayConstraint(), def),
      createParseArray(type_)
    );
  }

  /**
   * Creates a type instance that parses null values
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const value = BuiltType._null();
   *
   * ```
   */
  static _null() {
    return createType<null>({ constraint: new NullConstraint() });
  }

  /**
   * Creates a type instance that parses null and undefined values
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const value = BuiltType._undefined();
   *
   * ```
   */
  static _undefined() {
    return createType<undefined | null>({
      constraint: new NullishConstraint(),
    });
  }

  /**
   * Creates a type instance that parses Map<K,V> values into a Map<TKey, TValue>.
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const value = BuiltType._map(BuiltType.str(), BuiltType._str({ coerce: true }));
   *
   * const result = value.parse(new Map().set('lat', 6.133650).set('long', 1.223110));
   *
   * result.get('lat'); // '6.133650'
   * result.get('long'); // '1.223110'
   * ```
   */
  static _map<TKey, TValue>(
    tKey: _Type<TKey>,
    tValue: _Type<TValue>,
    def?: PartrialTypeDef<MapConstraint>
  ): _Type<Map<TKey, TValue>, TypeDef<ConstraintInterface>, Iterable<unknown>> {
    return createType<Map<TKey, TValue>>(
      mergeTypeDefRequiredParams(
        new MapConstraint(),
        def,
        def?.coerce
          ? (_value) =>
              typeof _value !== 'undefined' && _value !== null
                ? new Map(_value)
                : _value
          : undefined
      ),
      createParseMap(tKey, tValue)
    );
  }

  /**
   * Creates an set type instance
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * const bool = BuiltType._set({ coerce: true });
   *
   * // To apply constraint to parsed values:
   *
   * // Constrained type instance
   * const value = BuiltType._set({ constraint: (new SetConstraint).nonempty() });
   *
   * ```
   *
   */
  static _set<TValue>(
    tValue: _Type<TValue>,
    def?: PartrialTypeDef<SetConstraint>
  ): _Type<Set<TValue>, TypeDef<ConstraintInterface>, Iterable<unknown>> {
    return createType<Set<TValue>>(
      mergeTypeDefRequiredParams(
        new SetConstraint(),
        def,
        def?.coerce
          ? (_value) =>
              typeof _value !== 'undefined' && _value !== null
                ? new Set(_value)
                : _value
          : undefined
      ),
      createParseSet(tValue)
    );
  }

  /**
   * Creates a mixed type instance. Mixed types support any value without
   * any constraint.
   *
   *
   * ```ts
   * import { BuiltType } from '@azlabsjs/built-type';
   *
   * // Constrained type instance
   * const value = BuiltType._mixed();
   *
   * ```
   *
   */
  static _mixed() {
    return createType<any>({ constraint: new NoConstraint() });
  }

  /**
   * Creates an object type instance.
   *
   *
   * ```ts
   * import { BuiltType, BoolConstraint } from '@azlabsjs/built-type';
   *
   * const value = BuiltType._object({
   *    firstname: BuiltType._str(),
   *    lastname: BuiltType._str(),
   *    age: BuiltType._num(),
   *    birthdate: BuiltType._date(),
   *    active: BuiltType.bool({ coerce: true, constraint: new BoolConstraint }),
   *    address: BuiltType._object({
   *      country: BuiltType._str(),
   *      city: BuiltType._str(),
   *      poBox: BuiltType._num()
   *    }),
   *    list: BuiltType._array(BuiltType._str({ coerce: true })),
   *    map: BuiltType._map(BuiltType.str(), BuiltType._str({ coerce: true })),
   *    person: BuiltType._mixed()
   * });
   *
   * // Somtime input object provide a property name that developpers might want
   * // to bind to type property. The `_object` factory method allows developper to
   * // bind map input and output properties
   *
   * const value = BuiltType._object({
   *    firstname: BuiltType._str(),
   *    lastname: BuiltType._str(),
   *    age: BuiltType._num(),
   *    birthdate: BuiltType._date()
   * }, {birthdate: 'birth_date'});
   *
   * const result = value.parse({
   *     firstname: 'azandrew',
   *     lastname: 'sidoine',
   *     age: 23,
   *     birth_date: new Date('1999-05-10')
   * });
   *
   * console.log(result.birthdate) // new Date('1999-05-10')
   * ```
   *
   */
  static _object<T extends RawShapeType>(
    dict: T,
    propMap?: Partial<{ [k in keyof T]: string }>,
    def?: Omit<PartrialTypeDef, 'coerce'>
  ) {
    return createType<{
      [Property in keyof typeof dict]: TypeOf<typeof dict[Property]>;
    }>(
      mergeTypeDefRequiredParams(new ObjectConstraint(), def),
      createParseObject<{
        [Property in keyof typeof dict]: TypeOf<typeof dict[Property]>;
      }>(createPropMapFunc(dict, propMap))
    );
  }
}
