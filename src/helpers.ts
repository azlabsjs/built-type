import { RawShapeType, TypeAny } from './base';
import { ConstraintInterface, PartrialTypeDef, TypeDef } from './types';

/**
 * @internal
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
): TypeDef {
  const { constraint, coerce, description } =
    typeof def !== 'undefined' && def !== null && 'constraint' in def
      ? (def as Required<PartrialTypeDef>)
      : {
          description: undefined,
          coerce: false,
          ...(def ?? {}),
          constraint: c,
        };
  return { constraint, coerce: coerce ? coerceFunc : undefined, description };
}
// #endregion Helper fonctions
