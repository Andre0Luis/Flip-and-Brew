import type { Lang } from '@/i18n';
import type { Content } from './types';
import { pt } from './pt';
import { en } from './en';
import { es } from './es';

export const CONTENT: Record<Lang, Content> = { pt, en, es };
export type { Content, CreatorText, QuoteText, ArticleText, PracticeText, ItemText } from './types';
