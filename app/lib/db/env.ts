import { env } from 'cloudflare:workers';
import { D1ProgressRepository } from '@/app/lib/progress/repository';
export function getD1(): D1Database { if (!env.DB) throw new Error('D1 binding DB is unavailable'); return env.DB; }
export function getProgressRepository() { return new D1ProgressRepository(getD1()); }
