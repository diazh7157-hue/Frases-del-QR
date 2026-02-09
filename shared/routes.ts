
import { z } from 'zod';
import { insertPhraseSchema, phrases } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  phrases: {
    list: {
      method: 'GET' as const,
      path: '/api/phrases' as const,
      responses: {
        200: z.array(z.custom<typeof phrases.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/phrases' as const,
      input: insertPhraseSchema,
      responses: {
        201: z.custom<typeof phrases.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/phrases/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    random: {
      method: 'GET' as const,
      path: '/api/phrases/random' as const,
      responses: {
        200: z.custom<typeof phrases.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
