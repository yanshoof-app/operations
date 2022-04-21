import { Greeter } from '..';

describe('Tests greeter', () => {
  it('Says hello to Oshri', () => {
    expect(Greeter('Oshri')).toEqual('Hello Oshri');
  });
});
