import { z } from 'zod';

export interface ILoginSchemaMessages {
  invalidEmail: string;
  passwordRequired: string;
}

/** Built per locale on the client (translated messages); the Route Handler validates with the same rules. */
export const createLoginSchema = (messages: ILoginSchemaMessages) =>
  z.object({
    email: z.email(messages.invalidEmail),
    password: z.string().min(1, messages.passwordRequired),
  });

export type LoginFormData = z.input<ReturnType<typeof createLoginSchema>>;
