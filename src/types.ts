export enum AppRole {
  USER = 'user',
  TEACHER='teacher',
  ADMIN = 'admin',
}

export type Page<T> = {
  contents: T[],
  currentPage: number,
  perPage: number,
  totalElements: number,
  totalPage: number
}

export enum ContestStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
}

export enum ProblemDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum SubmissionStatus {
  ACCEPTED = 'accepted',
  COMPILATION_ERROR = 'compilation_error',
  PENDING = 'pending',
  PARTIAL = 'partial',
  FAILED = 'failed',
}

export type Language = {
  id: number,
  name: string,
  is_archived: boolean,
}

