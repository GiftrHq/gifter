import { z } from 'zod';

export const zodErrorToMessage = (error: z.ZodError): string => {
  return error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
};

export const createErrorDetails = (error: z.ZodError) => {
  return error.errors.reduce((acc, e) => {
    const path = e.path.join('.');
    acc[path] = e.message;
    return acc;
  }, {} as Record<string, string>);
};
