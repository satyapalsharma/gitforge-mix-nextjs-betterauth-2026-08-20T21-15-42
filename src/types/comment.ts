export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  userName?: string;
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}
