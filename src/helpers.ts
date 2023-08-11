import { RawShapeType, TypeAny, _AbstractType } from './base';
import { ObjectConstraint } from './type-constraints';
import {
  ConstraintInterface,
  PartrialTypeDef,
  SafeParseReturnType,
  TypeDef,
} from './types';

/**
 * @internal
 *
 * Property map creator function creator.
 */
export function createPropMapFunc<T extends RawShapeType>(
  shape: T,
  propertyMap?: Partial<Record<keyof T, string>>
) {
  return () => {
    const _propMap: { inputKey: string; _type: TypeAny; outputKey: string }[] =
      [];
    for (const key in shape) {
      _propMap.push({
        inputKey: propertyMap ? propertyMap[key] ?? key : key,
        _type: shape[key],
        outputKey: key,
      });
    }
    return _propMap;
  };
}

/**
 * @internal
 *
 * Merge required type definition properties in the user provided properties
 */
export function mergeTypeDefRequiredParams<T>(
  c: ConstraintInterface,
  def?: PartrialTypeDef,
  coerceFunc?: (value: any) => T
) {
  const { constraint, coerce, description } =
    typeof def !== 'undefined' && def !== null && 'constraint' in def
      ? (def as Required<PartrialTypeDef>)
      : {
          description: undefined,
          coerce: false,
          ...(def ?? {}),
          constraint: c,
        };
  const result = coerce
    ? { constraint, coerce: coerceFunc, description }
    : { constraint, description };

  return result;
}

/**
 * @internal
 */
export function createObjectReverseShape<T extends RawShapeType>(
  dict: T,
  propMap?: Partial<{ [k in keyof T]: string }>,
  def?: Omit<PartrialTypeDef, 'coerce'>
) {
  const _output = {} as RawShapeType;
  const _propMap = propMap ?? ({} as Partial<{ [k in keyof T]: string }>);
  const _outputPropMap = {} as Partial<{ [k: string]: keyof T }>;
  for (const key in dict) {
    // Case key is defined in the prop map, the output shape key is the value
    // of the key in the prop map object
    _output[_propMap[key] ? (_propMap[key] as string) : key] = dict[key];
  }

  for (const [_k, _v] of Object.entries(_propMap)) {
    if (_v) {
      _outputPropMap[_v] = _k;
    }
  }

  return [
    _output,
    _outputPropMap,
    mergeTypeDefRequiredParams(new ObjectConstraint(), def),
  ] as [RawShapeType, Partial<{ [k: string]: keyof T }>, TypeDef];
}

/**
 * Functional interface for parsing built type object.
 */
export function safeParse<T extends TypeAny>(
  value: T['_input'] | unknown,
  _type: T
): SafeParseReturnType<T['_output']> {
  return _type.safeParse(value);
}

/**
 * @internal
 *
 * Functional interface for parsing built type object.
 * It returns a safe parse result with the raw if the provided type is not defined.
 *
 * The function purposely returns a success=true if the type is not provided to prevent code
 * from breaking because the same object is returned.
 */
export function safeParseReverse<
  T extends _AbstractType<{ [k: string]: unknown }>
>(
  value: T['_output'],
  _type: T & { reverseType: _AbstractType<any> }
): SafeParseReturnType<T['_input']> {
  return _type.reverseType
    ? _type.reverseType.safeParse(value)
    : {
        errors: ['reverse type definition not provided'],
        success: true,
        data: value,
      };
}
// #endregion Helper fonctions
