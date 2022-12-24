/**
 * A constraint is a set of rules that can be applied to a given type
 * to insure that runtime code execute safely
 */
export interface ConstraintInterface {
  errors: unknown;

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

export type TypeDef<TContraint extends ConstraintInterface = ConstraintInterface> = {
  description?: string;
  coerce?: (value: any) => any;
  constraint: TContraint;
};

export type PartrialTypeDef<TContraint extends ConstraintInterface = ConstraintInterface> = {
  description?: string;
  coerce?: boolean;
  constraint?: TContraint;
};


/**
 * Return type of the type safe parse method
 */
export type SafeParseReturnType<T> = {
  errors: any;
  success: boolean;
  data?: T;
};
