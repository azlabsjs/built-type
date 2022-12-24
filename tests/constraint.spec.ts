import {
  ArrayConstraint,
  BoolConstraint,
  NumberConstraint,
  SetConstraint,
  StrConstraint,
} from '../src';

describe('Constraint', () => {
  it('test contraints and expect them to fail if value provided should fail', () => {
    expect(new StrConstraint().pattern(/\d/).apply('43').fails()).toBe(false);
    expect(
      new StrConstraint()
        .minLength(7)
        .maxLength(20)
        .startsWith('Lorem')
        .apply('Lorem Ipsum')
        .fails()
    ).toEqual(false);
    expect(
      new StrConstraint()
        .minLength(7)
        .maxLength(20)
        .startsWith('Lorem')
        .apply('Fails starts with')
        .fails()
    ).toEqual(true);
    expect(new NumberConstraint().int().apply(2).fails()).toEqual(false);
    expect(new NumberConstraint().float().apply(123.2).fails()).toBe(false);
    expect(new BoolConstraint().apply(23).fails()).toBe(true);
    expect(new BoolConstraint().apply(true).fails()).toBe(false);
    expect(new NumberConstraint().min(10).max(30).apply(15).fails()).toBe(
      false
    );
    expect(new NumberConstraint().min(10).max(30).apply(45).fails()).toBe(true);
    expect(new NumberConstraint().nullable().apply(null).fails()).toBe(false);
    expect(
      new ArrayConstraint().length(10).apply([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).fails()
    ).toBe(false);
    expect(new ArrayConstraint().min(2).apply([1, 2, 3]).fails()).toBe(false);
    expect(new ArrayConstraint().min(2).apply([1]).fails()).toBe(true);
    expect(new ArrayConstraint().max(2).apply([1, 2, 3]).fails()).toBe(true);
    expect(new ArrayConstraint().max(2).apply([1]).fails()).toBe(false);

    expect(new SetConstraint().min(2).apply(new Set([1, 2, 3])).fails()).toBe(false);
    expect(new SetConstraint().min(2).apply(new Set([1])).fails()).toBe(true);
    expect(new SetConstraint().max(2).apply(new Set([1, 2, 3])).fails()).toBe(true);
    expect(new SetConstraint().max(2).apply(new Set([1])).fails()).toBe(false);
  });
});
