import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DemoSectionProps {
  title: string;
  description: string;
  /** Hook names shown as badges, e.g. `useActionState`. */
  hooks: string[];
  children: ReactNode;
}

export function DemoSection({ title, description, hooks, children }: DemoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap gap-2'>
          {hooks.map((hook) => (
            <Badge key={hook} variant='secondary' className='font-mono'>
              {hook}
            </Badge>
          ))}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
