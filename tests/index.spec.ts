
import { SayHello } from '../src';

describe('SayHello Tests', () => {
  it('Greet the user provided name', () => {
    expect(SayHello('Bertrand')).toEqual('Hello, Bertrand');
  });
});
