import { RawShapeType, Type } from './base';
import { createPropMapFunc, mergeTypeDefRequiredParams } from './helpers';
import {
  createParseMap,
  createParseObject,
  createParseSet,
} from './parse-types';
import {
  BoolConstraint,
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

  static _string(def?: PartrialTypeDef<StrConstraint>) {
    return new Type<string>(
      mergeTypeDefRequiredParams(
        new StrConstraint(),
        def,
        def?.coerce ? (_value) => String(_value) : undefined
      ),
      (_value: any) => _value as string
    );
  }

  static _number(def?: PartrialTypeDef<NumberConstraint>) {
    return new Type<number>(
      mergeTypeDefRequiredParams(
        new NumberConstraint(),
        def,
        def?.coerce ? (_value) => Number(_value) : undefined
      ),
      (_value: any) => _value as number
    );
  }

  static _bool(def?: PartrialTypeDef<BoolConstraint>) {
    return new Type<boolean>(
      mergeTypeDefRequiredParams(
        new BoolConstraint(),
        def,
        def?.coerce ? (_value) => Boolean(_value) : undefined
      ),
      (_value: any) => _value as boolean
    );
  }

  static _symbol(def?: PartrialTypeDef): Type<symbol> {
    return new Type<symbol>(
      mergeTypeDefRequiredParams(
        new SymbolConstraint(),
        def,
        def?.coerce ? (_value) => Symbol(_value) : undefined
      ),
      (_value) => _value as symbol
    );
  }

  static _date(def?: PartrialTypeDef<DateContraint>) {
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

  static _array<T>(type_: Type<T>, def?: PartrialTypeDef<ArrayConstraint>) {
    return new Type<T[]>(
      mergeTypeDefRequiredParams(new ArrayConstraint(), def),
      parseArray(type_)
    );
  }

  static _null() {
    return new Type<null>({ constraint: new NullConstraint() });
  }

  static _undefined() {
    return new Type<undefined>({ constraint: new NullishConstraint() });
  }

  static _map<TKey, TValue>(
    tKey: Type<TKey>,
    tValue: Type<TValue>,
    def?: Omit<PartrialTypeDef<MapConstraint>, 'coerce'>
  ) {
    return new Type<Map<TKey, TValue>>(
      mergeTypeDefRequiredParams(new MapConstraint(), def),
      createParseMap(tKey, tValue)
    );
  }

  static _set<TValue>(
    tValue: Type<TValue>,
    def?: Omit<PartrialTypeDef<MapConstraint>, 'coerce'>
  ) {
    return new Type<Set<TValue>>(
      mergeTypeDefRequiredParams(new SetConstraint(), def),
      createParseSet(tValue)
    );
  }

  static mixed() {
    return new Type<any>({ constraint: new NoConstraint() });
  }

  static _object<T extends RawShapeType>(
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
