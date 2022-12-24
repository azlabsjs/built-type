import { RawShapeType, Type, TypeOf } from './base';
import { createPropMapFunc, mergeTypeDefRequiredParams } from './helpers';
import {
  createParseMap,
  createParseObject,
  createParseSet,
  parseArray,
  parseBool,
  parseDate,
  parseNumber,
  parseString,
  parseSymbol,
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
import { PartrialTypeDef } from './types';

export class BuiltType {

  static str(def?: PartrialTypeDef<StrConstraint>) {
    return new Type<string>(
      mergeTypeDefRequiredParams(
        new StrConstraint(),
        def,
        def?.coerce ? (_value) => String(_value) : undefined
      ),
      parseString
    );
  }

  static num(def?: PartrialTypeDef<NumberConstraint>) {
    return new Type<number>(
      mergeTypeDefRequiredParams(
        new NumberConstraint(),
        def,
        def?.coerce ? (_value) => Number(_value) : undefined
      ),
      parseNumber
    );
  }

  static bool(def?: PartrialTypeDef<BoolConstraint>) {
    return new Type<boolean>(
      mergeTypeDefRequiredParams(
        new BoolConstraint(),
        def,
        def?.coerce ? (_value) => Boolean(_value) : undefined
      ),
      parseBool
    );
  }

  static symbolType(def?: PartrialTypeDef): Type<symbol> {
    return new Type<symbol>(
      mergeTypeDefRequiredParams(
        new SymbolConstraint(),
        def,
        def?.coerce ? (_value) => Symbol(_value) : undefined
      ),
      parseSymbol
    );
  }

  static date(def?: PartrialTypeDef<DateContraint>) {
    return new Type<Date>(
      mergeTypeDefRequiredParams(
        new DateContraint(),
        def,
        def?.coerce
          ? (_value) => (!(_value instanceof Date) ? new Date(_value) : _value)
          : undefined
      ),
      parseDate
    );
  }

  static array<T>(type_: Type<T>, def?: PartrialTypeDef<ArrayConstraint>) {
    return new Type<T[]>(
      mergeTypeDefRequiredParams(new ArrayConstraint(), def),
      parseArray(type_)
    );
  }

  static nil() {
    return new Type<undefined>({ constraint: new NullConstraint() });
  }

  static nullish() {
    return new Type<undefined>({ constraint: new NullishConstraint() });
  }

  static map<TKey, TValue>(
    tKey: Type<TKey>,
    tValue: Type<TValue>,
    def?: Omit<PartrialTypeDef<MapConstraint>, 'coerce'>
  ) {
    return new Type<Map<TKey, TValue>>(
      mergeTypeDefRequiredParams(new MapConstraint(), def),
      createParseMap(tKey, tValue)
    );
  }

  static set<TValue>(
    tValue: Type<TValue>,
    def?: Omit<PartrialTypeDef<MapConstraint>, 'coerce'>
  ) {
    return new Type<Set<TValue>>(
      mergeTypeDefRequiredParams(new SetConstraint(), def),
      createParseSet(tValue)
    );
  }

  static any() {
    return new Type<any>({ constraint: new NoConstraint() });
  }

  static unknown() {
    return new Type<unknown>({ constraint: new NoConstraint() });
  }

  static object<T extends RawShapeType>(
    dict: T,
    propMap?: Partial<{ [k in keyof T]: string }>,
    def?: Omit<PartrialTypeDef, 'coerce'>
  ) {
    return new Type<{
      [Property in keyof typeof dict]: TypeOf<typeof dict[Property]>;
    }>(
      mergeTypeDefRequiredParams(new ObjectConstraint(), def),
      createParseObject<{
        [Property in keyof typeof dict]: TypeOf<typeof dict[Property]>;
      }>(
        createPropMapFunc(dict, propMap),
        new Object() as {
          [Property in keyof typeof dict]: TypeOf<typeof dict[Property]>;
        }
      )
    );
  }
}
