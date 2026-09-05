import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postsDir = path.join(root, 'all_collections', '_posts');
const historyDir = path.join(root, 'all_collections', '_history');
const projectsDir = path.join(root, 'all_collections', '_projects');
const errors = [];

const markdownFiles = async (directory) =>
  (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();

const slugFromFilename = (filename) =>
  filename
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');

const splitFrontmatter = (source, filename) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    errors.push(`${filename}: YAML frontmatter를 찾을 수 없습니다.`);
    return { frontmatter: '', body: source };
  }
  return { frontmatter: match[1], body: source.slice(match[0].length) };
};

const frontmatterValue = (frontmatter, field) =>
  frontmatter.match(new RegExp(`^${field}:\\s*(.*?)\\s*$`, 'm'))?.[1]?.trim();

const isPublished = (frontmatter) => frontmatterValue(frontmatter, 'published') !== 'false';

const validateTitle = (frontmatter, filename) => {
  const title = frontmatterValue(frontmatter, 'title');
  if (!title || title === "''" || title === '""') errors.push(`${filename}: title이 비어 있습니다.`);
};

const validateDate = (frontmatter, filename, required = true) => {
  const value = frontmatterValue(frontmatter, 'date');
  if (!value) {
    if (required) errors.push(`${filename}: date 필드가 없습니다.`);
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`${filename}: date는 YYYY-MM-DD 형식이어야 합니다.`);
    return;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    errors.push(`${filename}: 유효하지 않은 날짜 ${value}`);
  }
};

const scanExecutableLiquid = (body, filename) => {
  let fence = null;
  body.split(/\r?\n/).forEach((line, index) => {
    const marker = line.match(/^\s*(```+|~~~+)/)?.[1];
    if (marker) {
      if (!fence) fence = marker[0];
      else if (marker[0] === fence) fence = null;
      return;
    }
    if (fence) return;
    const withoutInlineCode = line.replace(/`+[^`]*`+/g, '');
    if (/\{%|\{\{/.test(withoutInlineCode)) {
      errors.push(`${filename}:${index + 1}: 코드 밖에 실행 가능한 Liquid 문법이 남아 있습니다.`);
    }
  });
};

const postFiles = await markdownFiles(postsDir);
const historyFiles = await markdownFiles(historyDir);
const projectFiles = await markdownFiles(projectsDir);
if (postFiles.length < 16) errors.push(`기존 포스트 16개 중 일부가 누락되었습니다. 현재 ${postFiles.length}개입니다.`);
if (historyFiles.length < 9) errors.push(`기존 연혁 9개 중 일부가 누락되었습니다. 현재 ${historyFiles.length}개입니다.`);
if (projectFiles.length < 3) errors.push(`기존 및 대표 프로젝트 3개 중 일부가 누락되었습니다. 현재 ${projectFiles.length}개입니다.`);

const posts = [];
const slugOwners = new Map();
for (const file of postFiles) {
  const source = await readFile(path.join(postsDir, file), 'utf8');
  const { frontmatter, body } = splitFrontmatter(source, file);
  validateTitle(frontmatter, file);
  validateDate(frontmatter, file);
  scanExecutableLiquid(body, file);
  const slug = slugFromFilename(file);
  if (!slug) errors.push(`${file}: URL slug를 만들 수 없습니다.`);
  if (slugOwners.has(slug)) errors.push(`${file}: ${slugOwners.get(slug)}와 URL slug '${slug}'가 중복됩니다.`);
  else slugOwners.set(slug, file);
  posts.push({ file, body, published: isPublished(frontmatter), url: `/posts/${slug}/` });
}

const allPostUrls = new Set(posts.map((post) => post.url));
const publicPostUrls = new Set(posts.filter((post) => post.published).map((post) => post.url));
for (const post of posts.filter((item) => item.published)) {
  const { file, body } = post;
  for (const match of body.matchAll(/\]\((\/posts\/[^)]+\/)\)/g)) {
    if (!allPostUrls.has(match[1])) errors.push(`${file}: 존재하지 않는 내부 글 링크 ${match[1]}`);
    else if (!publicPostUrls.has(match[1])) errors.push(`${file}: 비공개 글로 연결되는 링크 ${match[1]}`);
  }
}

for (const file of historyFiles) {
  const source = await readFile(path.join(historyDir, file), 'utf8');
  const { frontmatter } = splitFrontmatter(source, file);
  validateTitle(frontmatter, file);
  validateDate(frontmatter, file);
  if (/^(start_date|end_date):/m.test(frontmatter)) {
    errors.push(`${file}: 이전 start_date/end_date 필드가 남아 있습니다.`);
  }
}

for (const file of projectFiles) {
  const source = await readFile(path.join(projectsDir, file), 'utf8');
  const { frontmatter } = splitFrontmatter(source, file);
  validateTitle(frontmatter, file);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`검증 완료: 포스트 ${postFiles.length}개, 연혁 ${historyFiles.length}개, 프로젝트 ${projectFiles.length}개, slug·공개 링크·Liquid 정상.`);
}
