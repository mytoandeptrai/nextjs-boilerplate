'use client';
import { useTranslations, useDebounce, usePaginationQuery } from '@/hooks';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { DataTable } from '@/components/common';
import { useColumns } from './use-columns';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { CreateDialog } from './components/create-dialog';
import { EditDialog } from './components/edit-dialog';
import { useItem1ListQuery } from '@/api/item1';

export default function Item1Page() {
  const { t } = useTranslations();
  const { setPagination, ...pagination } = usePaginationQuery();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('name');
  const debouncedSearch = useDebounce(search);
  const router = useRouter();
  const pathname = usePathname();

  const { data } = useItem1ListQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    name: debouncedSearch,
    sort: sort ? [sort] : undefined,
  });

  const columns = useColumns(t);

  const openEditDialog = searchParams.get('action') === 'edit' && searchParams.has('id');

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>{t('item.management')}</h1>
        <CreateDialog />
      </div>
      <div className='flex flex-row gap-4'>
        <div className='relative w-1/4'>
          <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('item.searching')}
            className='pl-8'
          />
        </div>
        <Select onValueChange={(value) => setSort(value)}>
          <SelectTrigger className='!text-bg-primary border-bg-primary focus:border-bg-primary focus:ring-bg-primary [&>svg]:text-bg-primary w-24'>
            <SelectValue
              placeholder={t('item.sort')}
              className='!text-bg-primary font-medium !placeholder:text-bg-primary'
            />
          </SelectTrigger>
          <SelectContent className='rounded-md border border-gray-200 bg-white shadow-lg'>
            <SelectItem value='name' className='hover:bg-bg-primary/10 focus:bg-bg-primary/10 cursor-pointer'>
              {t('item.name')}
            </SelectItem>
            <SelectItem value='category' className='hover:bg-bg-primary/10 focus:bg-bg-primary/10 cursor-pointer'>
              {t('item.category')}
            </SelectItem>
            <SelectItem value='price' className='hover:bg-color-primary/10 focus:bg-color-primary/10 cursor-pointer'>
              {t('item.price')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={data?.items || []}
        onPaginationChange={setPagination}
        listMeta={{
          count: data?.meta.count || 0,
          per_page: data?.meta.per_page || 10,
          current_page: data?.meta.current_page || 1,
          total_pages: data?.meta.total_pages || 1,
          total: data?.meta.total || 0,
        }}
        containerClassName='flex-1'
      />

      {openEditDialog && searchParams.get('id') && (
        <EditDialog
          isOpen={openEditDialog}
          onOpenChange={(open) => {
            // Closing the dialog resets the URL parameters, which is what drives `openEditDialog`.
            if (!open) router.replace(pathname);
          }}
          item={data?.items.find((item) => item.id === searchParams.get('id'))}
        />
      )}
    </div>
  );
}
