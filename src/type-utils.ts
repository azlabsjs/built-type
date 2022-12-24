
// export namespace TypeUtil {
//   export type MergeShapes<U extends RawShapeType, V extends RawShapeType> = {
//     [k in Exclude<keyof U, keyof V>]: U[k];
//   } & V;

//   type OptionalKeys<T extends object> = {
//     [k in keyof T]: undefined extends T[k] ? k : never;
//   }[keyof T];

//   type RequiredKeys<T extends object> = {
//     [k in keyof T]: undefined extends T[k] ? never : k;
//   }[keyof T];

//   export type AddQuestionMarks<T extends object> = Partial<
//     Pick<T, OptionalKeys<T>>
//   > &
//     Pick<T, RequiredKeys<T>>;

//   export type Identity<T> = T;

//   export type Flatten<T extends object> = Identity<{ [k in keyof T]: T[k] }>;

//   export type NoNeverKeys<T extends RawShapeType> = {
//     [k in keyof T]: [T[k]] extends [never] ? never : k;
//   }[keyof T];

//   export type NoNever<T extends RawShapeType> = Identity<{
//     [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
//   }>;

//   export const MergeShapes = <U extends RawShapeType, T extends RawShapeType>(
//     first: U,
//     second: T
//   ): T & U => {
//     return { ...first, ...second };
//   };

//   export type BaseObjectOutputType<Shape extends RawShapeType> =
//       TypeUtil.Flatten<
//           TypeUtil.AddQuestionMarks<{
//               [k in keyof Shape]: Shape[k]["_output"];
//           }>
//       >;
//   export type ObjectOutputType<
//       Shape extends RawShapeType,
//       Catchall extends TypeAny
//   > = TypeAny extends Catchall
//       ? TypeUtil.BaseObjectOutputType<Shape>
//       : TypeUtil.Flatten<
//           TypeUtil.BaseObjectOutputType<Shape> & { [k: string]: Catchall["_output"] }
//       >;
// }
