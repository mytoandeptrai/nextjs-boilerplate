'use client';

import { MessageCircle, SendHorizontal, X } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import { CHAT_LIMITS, type ChatMessage, type IChatError, useChatStatusQuery, useSendChatMutation } from '@/api/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HttpStatus } from '@/enums/enum';
import { useTranslations } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { IApiError } from '@/types/type';

const SUGGESTIONS = ['suggestionPrice', 'suggestionBedroom', 'suggestionOrder'] as const;

/** The assistant writes Markdown. Site paths become in-app links (the chat survives the navigation). */
function Reply({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className='mt-2 first:mt-0'>{children}</p>,
        ul: ({ children }) => <ul className='mt-2 list-disc space-y-1 pl-4 first:mt-0'>{children}</ul>,
        ol: ({ children }) => <ol className='mt-2 list-decimal space-y-1 pl-4 first:mt-0'>{children}</ol>,
        a: ({ href, children }) =>
          href?.startsWith('/') && !href.startsWith('//') ? (
            <Link href={href} className='text-brand underline underline-offset-2'>
              {children}
            </Link>
          ) : (
            <span>{children}</span>
          ),
        // Images and raw HTML are never rendered: the model only has text to offer.
        img: () => null,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/**
 * Floating chat with the store assistant (`POST /api/chat`). The conversation lives in memory, per tab.
 * Renders nothing on a server without a Gemini key.
 */
export function ChatWidget() {
  const { t, locale } = useTranslations('store.chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const { data: status } = useChatStatusQuery();
  const { mutate, isPending } = useSendChatMutation();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the conversation changes
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, isPending, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const _handleError = (error: IApiError) => {
    const code = (error.details as Partial<IChatError> | undefined)?.code;

    if (code === 'overloaded') return void toast.error(t('errorOverloaded'));
    if (error.status === HttpStatus.TOO_MANY_REQUESTS) return void toast.error(t('errorRateLimit'));

    toast.error(t('errorGeneric'));
  };

  const _send = (text: string) => {
    const content = text.trim();

    if (!content || isPending) return;

    const history = messages;
    const next: ChatMessage[] = [...history, { role: 'user', content }];

    setMessages(next);
    setDraft('');
    mutate(
      { messages: next.slice(-CHAT_LIMITS.historyLength), locale },
      {
        onSuccess: ({ reply }) => setMessages((current) => [...current, { role: 'assistant', content: reply }]),
        // Nothing was answered: take the question back out and hand it back for another try.
        onError: (error) => {
          setMessages(history);
          setDraft(content);
          _handleError(error);
        },
      }
    );
  };

  const _handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    _send(draft);
  };

  if (!status?.enabled) return null;

  return (
    <>
      {isOpen ? (
        <section
          role='dialog'
          aria-label={t('title')}
          data-testid='chat-panel'
          className='bg-background fixed right-4 bottom-20 z-40 flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col border shadow-xl'
        >
          <header className='bg-primary text-primary-foreground flex items-center justify-between px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>{t('title')}</p>
              <p className='text-xs opacity-80'>{t('subtitle')}</p>
            </div>
            <button type='button' aria-label={t('close')} onClick={() => setIsOpen(false)} className='p-1'>
              <X className='size-4' aria-hidden />
            </button>
          </header>

          <div className='flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm leading-6' aria-live='polite'>
            <div className='bg-muted mr-8 px-3 py-2'>{t('greeting')}</div>
            {messages.length === 0 ? (
              <div className='flex flex-wrap gap-2'>
                {SUGGESTIONS.map((key) => (
                  <button
                    key={key}
                    type='button'
                    onClick={() => _send(t(key))}
                    className='hover:border-foreground border px-3 py-1.5 text-left text-xs transition-colors'
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            ) : null}
            {messages.map((message, index) => (
              <div
                key={index}
                data-testid={`chat-${message.role}`}
                className={cn(
                  'px-3 py-2 break-words',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-8 whitespace-pre-wrap'
                    : 'bg-muted mr-8'
                )}
              >
                {message.role === 'user' ? message.content : <Reply content={message.content} />}
              </div>
            ))}
            {isPending ? (
              <div className='bg-muted text-muted-foreground mr-8 px-3 py-2' data-testid='chat-typing'>
                {t('typing')}
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <form onSubmit={_handleSubmit} className='flex gap-2 border-t p-3'>
            <Input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={CHAT_LIMITS.messageLength}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              className='rounded-none'
            />
            <Button
              type='submit'
              size='icon'
              className='shrink-0 rounded-none'
              disabled={isPending || !draft.trim()}
              aria-label={t('send')}
            >
              <SendHorizontal className='size-4' aria-hidden />
            </Button>
          </form>
          <p className='text-muted-foreground px-3 pb-2 text-[11px] leading-4'>{t('disclaimer')}</p>
        </section>
      ) : null}

      <button
        type='button'
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? t('close') : t('open')}
        aria-expanded={isOpen}
        data-testid='chat-toggle'
        className='bg-primary text-primary-foreground fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105'
      >
        {isOpen ? <X className='size-5' aria-hidden /> : <MessageCircle className='size-5' aria-hidden />}
      </button>
    </>
  );
}
