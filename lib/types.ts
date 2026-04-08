export type ActionState = {
  errors: string[];
  success: string;
};

export type FormState = ActionState | undefined;

export interface Project {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}