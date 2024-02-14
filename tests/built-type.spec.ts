import {
  BuiltType,
  NumberConstraint,
  Patterns,
  SetConstraint,
  StrConstraint,
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
    }).nullish();

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

  it('should return original object when reverse type safeParse is requested', () => {
    const Person = BuiltType._object(
      {
        firstName: BuiltType._str().nullable(),
        lastName: BuiltType._str().nullish(),
        age: BuiltType._num(),
        address: BuiltType._object(
          {
            email: BuiltType._str(),
            phoneNumber: BuiltType._str({
              constraint: new StrConstraint().nullish(),
            }),
          },
          {
            phoneNumber: 'phone_number',
          }
        ),
        grades: BuiltType._array(BuiltType._num(), {
          coerce: true,
        }).nullish(),
      },
      {
        firstName: 'first_name',
        lastName: 'last_name',
      }
    );

    const john = Person.parse({
      first_name: 'Peter',
      last_name: null,
      age: 23,
      address: {
        email: 'john-peter@example.com',
        phone_number: '+1802499825',
      },
      grades: undefined,
    });

    expect(john.grades).toEqual([]);
    expect(john.firstName).toEqual('Peter');
    expect(john.lastName).toEqual(null);
    expect(john.age).toEqual(23);
    expect(john.address.email).toEqual('john-peter@example.com');
    expect(john.address.phoneNumber).toEqual('+1802499825');

    const source = Person.reverseType.parse(john);
    expect(source.first_name).toEqual('Peter');
    expect(source.last_name).toEqual(null);
    expect(source.age).toEqual(23);
    expect(source.address.phone_number).toEqual('+1802499825');
    expect(source.address.email).toEqual('john-peter@example.com');
    expect(source.grades).toEqual([]);
  });
});
