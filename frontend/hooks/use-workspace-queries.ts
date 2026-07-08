import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from "@tanstack/react-query";
import { getDocuments, getDocument, updateDocument } from "@/actions/documents";
import { getConversations, getConversation, createConversation } from "@/actions/conversations";
import { getProject } from "@/actions/projects";
import { Document, Conversation } from "@/lib/schemas";
import { Project } from "@/lib/types";

// Queries
export function useProjectQuery(projectId: string) {
  return useQuery<Project | null>({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDocumentsQuery(projectId: string) {
  return useQuery<Document[]>({
    queryKey: ["documents", projectId],
    queryFn: () => getDocuments(projectId),
  });
}

export function useDocumentQuery(docId: string | null) {
  return useQuery<Document | null>({
    queryKey: ["document", docId],
    queryFn: () => (docId ? getDocument(docId) : null),
    enabled: !!docId,
  });
}

export function useConversationsQuery(projectId: string) {
  return useQuery<Conversation[]>({
    queryKey: ["conversations", projectId],
    queryFn: () => getConversations(projectId),
  });
}

export function useConversationQuery(convId: string | null) {
  return useQuery<Conversation | null>({
    queryKey: ["conversation", convId],
    queryFn: () => (convId ? getConversation(convId) : null),
    enabled: !!convId,
  });
}

// Mutations
export function useUpdateDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, title, content }: { docId: string; title?: string; content?: string }) => 
      updateDocument(docId, title, content),
    onSuccess: (data, variables) => {
      // Invalidate both the list and the specific document
      queryClient.invalidateQueries({ queryKey: ["document", variables.docId] });
      // We don't necessarily need to invalidate the whole list for a content update
    }
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, title }: { projectId: string; title: string }) => 
      createConversation(projectId, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", variables.projectId] });
    }
  });
}
