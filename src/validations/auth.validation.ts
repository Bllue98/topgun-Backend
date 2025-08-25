import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string(),
    password: z.string().min(3),
    hash: z.string().optional()
  })
});

export const signupSchema = z.object({
  body: loginSchema.shape.body.extend({
    username: z.string().min(2)
  })
});
