import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureTimestamp', async: false })
export class IsFutureTimestampConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    if (typeof value !== 'number') {
      return false;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    return value > currentTimestamp;
  }

  defaultMessage(): string {
    return 'Expiration timestamp must be in the future';
  }
}

/**
 * Validates that the expiration timestamp is in the future
 */
export function IsFutureTimestamp(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureTimestampConstraint,
    });
  };
}
