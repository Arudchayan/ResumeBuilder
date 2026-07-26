import type { ResumeDocument } from "@resume/core";

export interface Session {
  userId: string;
  email: string;
  displayName: string;
}

/** Future SaaS auth — Phase A returns null. */
export interface AuthPort {
  getSession(): Promise<Session | null>;
  signIn?(provider: string): Promise<Session>;
  signOut?(): Promise<void>;
}

export interface BulletSuggestContext {
  role: string;
  company: string;
  existingBullets: string[];
}

/** Future AI assist — Phase A is a no-op / feature-flagged off. */
export interface AiPort {
  isEnabled(): boolean;
  suggestBullets(ctx: BulletSuggestContext): Promise<string[]>;
}

export interface ResumeMeta {
  id: string;
  title: string;
  template: string;
  updatedAt: number;
}

export interface ResumeLibraryPort {
  list(): Promise<ResumeMeta[]>;
  create(template?: string): Promise<ResumeDocument>;
  get(id: string): Promise<ResumeDocument | null>;
  save(doc: ResumeDocument): Promise<void>;
  duplicate(id: string): Promise<ResumeDocument>;
  delete(id: string): Promise<void>;
}

export interface StoragePort {
  load(id: string): Promise<ResumeDocument | null>;
  save(doc: ResumeDocument): Promise<void>;
  list(): Promise<ResumeMeta[]>;
  delete(id: string): Promise<void>;
}

export class NullAuthPort implements AuthPort {
  async getSession(): Promise<Session | null> {
    return null;
  }
}

export class DisabledAiPort implements AiPort {
  isEnabled(): boolean {
    return false;
  }
  async suggestBullets(): Promise<string[]> {
    return [];
  }
}
