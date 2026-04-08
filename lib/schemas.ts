import * as z from "zod";

export const SignupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
      .trim(),
    email: z.email({ message: "Correo electrónico inválido" }).trim(),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.email({ message: "Correo electrónico inválido" }).trim(),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.email({ message: "Correo electrónico inválido" }).trim(),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export const SuccessResponseSchema = z.object({
  message: z.string(),
});

export const LoginResponseSchema = z.object({
  access_token: z.string(),
});

export const ErrorResponseSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]), // ← aceptar ambos
  error: z.string(),
  statusCode: z.number(),
});

