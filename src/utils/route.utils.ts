import type { Router } from 'express';
import type { ObjectLiteral } from 'typeorm';
import type { ZodSchema } from 'zod';
import type { BaseController } from 'src/controllers/shared/base.controller';
import validate from 'src/middleware/validate';

export function addCrudOperationsToRouter<Entity extends ObjectLiteral>(
  router: Router,
  controller: BaseController<Entity>,
  createValidationSchema?: ZodSchema,
  updateValidationSchema?: ZodSchema,
  retrieveRelations?: string[]
) {
  router.post('/', validate(createValidationSchema), controller.create);
  router.get('/', controller.search);
  router.get('/:id', controller.retrieve(retrieveRelations));
  router.put('/:id', validate(updateValidationSchema), controller.save);
  router.delete('/:id', controller.delete);
}
