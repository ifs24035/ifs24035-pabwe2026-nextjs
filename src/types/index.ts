export type User = {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PostAuthor = {
  id?: number;
  name?: string | null;
  photo?: string | null;
};

export type PostComment = {
  id: number;
  comment: string;
  user_id?: number;
  author?: PostAuthor | null;
  created_at?: string;
  updated_at?: string;
};

export type Post = {
  id: number;
  user_id: number;
  cover?: string | null;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  author?: PostAuthor | null;
  likes?: number[];
  comments?: Array<PostComment | number>;
  my_comment?: PostComment | null;
};

export type ApiResult<T = unknown> = {
  status?: string;
  success?: boolean;
  message?: string;
  data?: T;
};

export type { RootState, AppDispatch } from "@/store";
