import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

/**
 * Markdown written by an admin. `react-markdown` never renders raw HTML (no `rehype-raw`), so a pasted `<script>`
 * shows up as text. Headings start at `h2` because the page already has its `h1`.
 */
export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn('prose-guide', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children }) => (
            <a href={href} {...(href?.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {children}
            </a>
          ),
          // biome-ignore lint/performance/noImgElement: admin-pasted URLs can be on any host, the optimizer only allows the bucket
          img: ({ src, alt }) => <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading='lazy' />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
