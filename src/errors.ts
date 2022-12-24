/**
 * Typescript or javascript error object that is thrown on parse failure
 */
export class ParseError<TError> extends Error {
  get errors() {
    return this._errors;
  }
  constructor(private readonly _errors: TError, message?: string) {
    super(message);
  }
}
