import { createType } from './base';
import {
  createObjectReverseShape,
  createPropMapFunc,
  mergeTypeDefRequiredParams,
  safeParse,
  safeParseReverse,
} from './helpers';
import {
  createParseArray,
  createParseMap,
  createParseObject,
  createParseSet,
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
  SymbolConstraint,
} from './type-constraints';
import {
  ConstraintInterface,
  PartrialTypeDef,
  RawShapeType,
  TypeDef,
  TypeOf,
  UnknownType,
  _AbstractType,
  _ObjectType,
} from './types';

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
  ): _AbstractType<string, TypeDef<ConstraintInterface>> {
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
  ): _AbstractType<number, TypeDef<ConstraintInterface>> {
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
  ): _AbstractType<boolean, TypeDef<ConstraintInterface>> {
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
  ): _AbstractType<symbol, TypeDef<ConstraintInterface>> {
    return createType<symbol>(
      mergeTypeDefRequiredParams(
        new SymbolConstraint(),
        def,
        def?.coerce
          ? (v) =>
              typeof v !== 'undefined' && v !== null ? Symbol(v as string) : v
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
  ): _AbstractType<Date, TypeDef<ConstraintInterface>> {
    return createType<Date>(
      mergeTypeDefRequiredParams(
        new DateContraint(),
        def,
        def?.coerce
          ? (_value) =>
              typeof _value !== 'undefined' && _value !== null
                ? !(_value instanceof Date)
                  ? new Date(_value as string)
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
    t: _AbstractType<T>,
    def?: PartrialTypeDef<ArrayConstraint>
  ): _AbstractType<T[], TypeDef<ConstraintInterface>> {
    return createType<T[]>(
      mergeTypeDefRequiredParams(
        new ArrayConstraint(),
        def,
        def?.coerce
          ? (v) => {
              return typeof v === 'undefined' || v === null
                ? []
                : Array.isArray(v)
                  ? v
                  : [v];
            }
          : undefined
      ),
      createParseArray(t)
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
    tKey: _AbstractType<TKey>,
    tValue: _AbstractType<TValue>,
    def?: PartrialTypeDef<MapConstraint>
  ): _AbstractType<
    Map<TKey, TValue>,
    TypeDef<ConstraintInterface>,
    Iterable<TValue>
  > {
    return createType<Map<TKey, TValue>>(
      mergeTypeDefRequiredParams(
        new MapConstraint(),
        def,
        def?.coerce
          ? (v) =>
              typeof v !== 'undefined' && v !== null
                ? new Map(v as Iterable<UnknownType>)
                : v
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
    t: _AbstractType<TValue>,
    def?: PartrialTypeDef<SetConstraint>
  ): _AbstractType<
    Set<TValue>,
    TypeDef<ConstraintInterface>,
    Iterable<TValue>
  > {
    return createType<Set<TValue>>(
      mergeTypeDefRequiredParams(
        new SetConstraint(),
        def,
        def?.coerce
          ? (v) =>
              typeof v !== 'undefined' && v !== null
                ? new Set(v as Iterable<UnknownType>)
                : v
          : undefined
      ),
      createParseSet(t)
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
    return createType<UnknownType>({ constraint: new NoConstraint() });
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
    propMap: Partial<{ [k in keyof T]: string }> = {},
    def?: Omit<PartrialTypeDef, 'coerce'>
  ) {
    return createType(
      mergeTypeDefRequiredParams(new ObjectConstraint(), def),
      createParseObject<{
        [Prop in keyof T]: TypeOf<T[Prop]>;
      }>(createPropMapFunc(dict, propMap), (_type, value) =>
        safeParse(value, _type)
      ),
      // Provide an object reverse type factory function
      // which is internally invoked if developper request for a reverseType instance
      () => {
        const [_shape, _propMap, _def] = createObjectReverseShape(
          dict,
          propMap,
          def
        );
        return createType(
          _def,
          createParseObject(
            createPropMapFunc(
              _shape,
              _propMap as Partial<Record<keyof typeof _shape, string>>
            ),
            (_type, value) =>
              safeParseReverse(
                value,
                _type as _AbstractType<UnknownType> & {
                  reverseType: _AbstractType<unknown>;
                }
              )
          )
        );
      }
    ) as unknown as _ObjectType<T>;
  }
}
