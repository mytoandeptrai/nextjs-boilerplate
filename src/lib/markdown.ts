/** First paragraph of a Markdown document as plain text, for cards and meta descriptions. */
export const getExcerpt = (markdown: string, maxLength = 160): string => {
  const paragraph =
    markdown
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find((block) => block && !/^(#|!\[|```|>|\||-{3,})/.test(block)) ?? '';
  const text = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
};
