import { JoiRequestValidationError } from '../helpers/error-handler'
import { Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return function (target: any, key: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, req: Request, res: Response): Promise<void> {
      const { error } = await schema.validateAsync(req.body);
      if (error) {
        throw new JoiRequestValidationError(error.details[0].message)
      }
      return originalMethod.call(this, req, res);
    };
  };
}
