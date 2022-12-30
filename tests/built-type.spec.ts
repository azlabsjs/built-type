import {
  BuiltType,
  NumberConstraint,
  Patterns,
  SetConstraint,
  StrConstraint
} from '../src';

describe('BuiltType', () => {
  it('Create a built type instance for string value and expect type instance to parse string value and number value with coercing and fails on number wihtout coercing', () => {
    const str = BuiltType._str({ coerce: true });

    let result = str.safeParse(1);
    expect(result.success).toEqual(true);
    result = str.safeParse('azandrew-sidoine');
    expect(result.success).toEqual(true);
    expect(result.data).toEqual('azandrew-sidoine');

    const noCoerceStr = BuiltType._str();
    result = noCoerceStr.safeParse(1);
    expect(result.success).toEqual(false);
  });

  it('Expect parse to fail with constraint applied', () => {
    const str = BuiltType._str({
      coerce: true,
      constraint: new StrConstraint().pattern(Patterns.uuid),
    });

    let result = str.safeParse('azandrew-sidoine');
    expect(result.success).toEqual(false);

    result = str.safeParse('d28a0f59-a273-495a-a283-5bedf659a67a');
    expect(result.success).toEqual(true);
  });

  it('expect safe parse to fail when not using coercing on string and passes when used', () => {
    const num = BuiltType._num({ coerce: true });

    let result = num.safeParse('1');
    expect(result.success).toEqual(true);

    const noCoerceNum = BuiltType._num();
    result = noCoerceNum.safeParse('1');
    expect(result.success).toEqual(false);

    result = num.safeParse(34);

    expect(result.data).toEqual(34);
  });

  it('Expect parse to fail on BuiltType._num() returned instance when constraint applied', () => {
    const num = BuiltType._num({
      coerce: true,
      constraint: new NumberConstraint().min(2),
    });

    let result = num.safeParse(0);
    expect(result.success).toEqual(false);

    result = num.safeParse(4);
    expect(result.success).toEqual(true);
  });

  it('Expect parse to fail on BuiltType._set() returned instance when applied', () => {
    const set = BuiltType._set(BuiltType._num(), { coerce: true });

    let result = set.safeParse([1, 3, 4]);
    expect(result.success).toEqual(true);
    expect(Array.from(result.data?.values() ?? [])).toEqual([1, 3, 4]);
    const builtSet = BuiltType._set(BuiltType._str(), {
      constraint: new SetConstraint().nonempty(),
    });
    expect(builtSet.safeParse([]).success).toBe(false);
  });

  it('', () => {
    const person = BuiltType._object(
      {
        firstname: BuiltType._str({ coerce: true }),
        lastname: BuiltType._str({ coerce: true }),
        email: BuiltType._str(),
      },
      { email: 'address.email' }
    );

    const result = person.safeParse({
      firstname: 'John',
      lastname: 'Doe',
      address: {
        email: 'johndoe@example.com'
      }
    });

    expect(result.success).toEqual(true);
    expect(result.data?.email).toEqual('johndoe@example.com');
    expect(result.data?.firstname).toEqual('John');
  });
});
