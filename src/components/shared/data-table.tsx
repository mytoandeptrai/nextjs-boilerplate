'use client';

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from './data-table-pagination';
import type { PaginatedListResponse } from '@/types/common';
import { cn } from '@/libs/utils';
import { transformMetaToPaginationState } from '@/utils/pagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onPaginationChange: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  listMeta?: PaginatedListResponse<TData>['meta'];
  containerClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onPaginationChange,
  listMeta,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    pageCount: listMeta?.total_pages || 0,
    data,
    state: {
      pagination: transformMetaToPaginationState(listMeta),
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const state = updater(transformMetaToPaginationState(listMeta));
        onPaginationChange(state);
      } else {
        onPaginationChange(updater);
      }
    },
    manualPagination: true,
  });

  return (
    <div className={cn('rounded-md border pb-2', containerClassName)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
