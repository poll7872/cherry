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

export const UserResponseSchema = z.object({
  email: z.email(),
  name: z.string(),
});

export const ErrorResponseSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]), // ← aceptar ambos
  error: z.string(),
  statusCode: z.number(),
});

// Proyectos
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  userId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre del proyecto debe tener al menos 3 caracteres" })
    .trim(),
  description: z.string().max(200, { message: "La descripción es demasiado larga" }).optional(),
});

export type CreateProjectFormData = z.infer<typeof CreateProjectSchema>;


// Documentos (LaTeX)
export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1, "El título es requerido").optional(),
  content: z.string().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;


// IA: Conversaciones y Mensajes
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  conversationId: z.string(),
  timestamp: z.string(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(MessageSchema).optional(),
});

export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
