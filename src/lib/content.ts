import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type HistoryItem = CollectionEntry<'history'>;
export type Project = CollectionEntry<'projects'>;

const categoryNames: Record<string, string> = {
  ai: 'AI',
  blog: 'Blog',
  css: 'CSS',
  dev: 'Dev',
  heimerruri: 'HeimerRuri',
  html: 'HTML',
  javascript: 'JavaScript',
  jekyll: 'Jekyll',
  project: 'Project',
  python: 'Python',
  security: 'Security',
};

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  })
    .format(date)
    .replace(/\. /g, '.')
    .replace(/\.$/, '');

export const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'UTC',
  })
    .format(date)
    .replace(/\. /g, '.')
    .replace(/\.$/, '');

export const postSlug = (post: Post) =>
  post.id
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');

export const projectSlug = (project: Project) =>
  project.id
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');

export const normalizeCategory = (value: string) => value.trim().toLowerCase();

export const categoryDialogId = (value: string) =>
  `category-${normalizeCategory(value).replace(/[^a-z0-9가-힣]+/g, '-')}`;

export const categoryLabel = (value: string) => {
  const key = normalizeCategory(value);
  return categoryNames[key] ?? value.trim();
};

export const sortPosts = (posts: Post[]) =>
  [...posts]
    .filter((post) => post.data.published)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));

export const historyDate = (item: HistoryItem) => item.data.date;

export const sortHistory = (items: HistoryItem[]) =>
  [...items]
    .filter((item) => item.data.published)
    .sort((a, b) => historyDate(b).getTime() - historyDate(a).getTime() || a.id.localeCompare(b.id));

export const sortProjects = (projects: Project[]) =>
  [...projects]
    .filter((project) => project.data.published)
    .sort((a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      (b.data.start_date?.getTime() ?? 0) - (a.data.start_date?.getTime() ?? 0) ||
      a.id.localeCompare(b.id),
    );

export const categoryIndex = (posts: Post[]) => {
  const index = new Map<string, { label: string; posts: Post[] }>();
  for (const post of sortPosts(posts)) {
    const seen = new Set<string>();
    for (const raw of post.data.categories) {
      const key = normalizeCategory(raw);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const existing = index.get(key) ?? { label: categoryLabel(raw), posts: [] };
      existing.posts.push(post);
      index.set(key, existing);
    }
  }
  return [...index.entries()]
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'));
};
