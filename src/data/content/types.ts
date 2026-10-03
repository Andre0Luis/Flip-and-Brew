export type QuoteText = { text: string; author: string; source: string; context: string; tryToday: string[] };
export type ArticleText = { title: string; summary: string; oneLine: string; inApp: string; body: string[]; tryToday: string[] };
export type PracticeText = { title: string; text: string };
export type ItemText = { name: string; blurb: string };

/** Texto da tela "Por que este app existe", escrito pelo criador. */
export type CreatorText = { title: string; byline: string; motto: string; blocks: { heading: string; text: string }[]; closing: string; signature: string };

export type Content = {
  creator: CreatorText;
  quotes: Record<string, QuoteText>;
  articles: Record<string, ArticleText>;
  practices: Record<string, PracticeText>;
  items: Record<string, ItemText>;
};
