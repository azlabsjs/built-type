/**
 * Basic string pattern for string regex validations
 */
export class Patterns {
  /**
   * CUID validation pattern
   */
  public static readonly cuid = /^c[^\s-]{8,}$/i;

  /**
   * UUID validation pattern
   */
  public static readonly uuid =
    /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;

  /**
   * Email validation pattern
   */
  public static readonly email =
    /^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+.)+[^<>()[\].,;:\s@"]{2,})$/i;

  // Adapted from https://stackoverflow.com/a/3143231
  /**
   * Datetime validation pattern
   */
  public static readonly datetime = (args: {
    precision?: number;
    offset?: boolean;
  }) => {
    if (args.precision) {
      if (args.offset) {
        return new RegExp(
          `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}:\\d{2})|Z)$`
        );
      } else {
        return new RegExp(
          `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`
        );
      }
    } else if (args.precision === 0) {
      if (args.offset) {
        return new RegExp(
          `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}:\\d{2})|Z)$`
        );
      } else {
        return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
      }
    } else {
      if (args.offset) {
        return new RegExp(
          `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}:\\d{2})|Z)$`
        );
      } else {
        return new RegExp(
          `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`
        );
      }
    }
  };
}
