import * as NextImage from 'next/image';
import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';
import { cn } from '@/libs/utils';
import type { FCC } from '@/types';

import { FILE_FORMAT } from '@/constants';
import { validateFileFormat, validateFileSize } from '@/utils';
import { toast } from 'sonner';
import { HStack, VStack } from '../utilities';
import { Button } from './button';
import { useIsMobile } from '@/hooks/use-mobile';

interface IValidate {
  size?: number;
  format?: string[];
  sizeMessage?: string;
  formatMessage?: string;
}

interface ISizeValidate {
  width: number;
  height: number;
  message: string;
  type?: 'greaterThan' | 'lessThan';
}

export interface InputFileProps {
  onChange: (file: File | null, blob?: string) => void;
  className?: string;
  containerClassName?: string;
  preview?: File | string | null;
  withBorder?: boolean;
  disabled?: boolean;
  validate?: IValidate;
  description?: ReactNode;
  sizeValidate?: ISizeValidate;
  withClear?: boolean;
  accept?: string;
  trashIconSize?: number;
  besideComp?: ReactNode;
}

const InputFile: FCC<InputFileProps> = ({
  onChange,
  preview,
  withBorder = true,
  disabled = false,
  withClear = true,
  containerClassName,
  className,
  description,
  validate = {
    size: 100,
    format: FILE_FORMAT,
    sizeMessage: 'Upload failed, please try again. File must be no exceed 100MB in size.',
    formatMessage: 'Upload failed, please try again. The file must be in JPG, PNG, SVG or GIF format',
  },
  sizeValidate = {
    width: 0,
    height: 0,
    message: 'Please use PNG or JPG files larger than 0 x 0 px',
    type: 'greaterThan',
  },
  accept = '.png,.jpg,.jpeg,.webp',
  trashIconSize = 32,
  besideComp,
}) => {
  const [blob, setBlob] = useState('');
  const targetRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files?.length === 0) return;

    const file = files![0];

    if (!validateFileFormat(file)) {
      toast.error('Upload failed, please try again. The file must be in JPG, PNG,SVG or GIF format');
      return;
    }

    const fileBlob = URL?.createObjectURL(file);

    setBlob(fileBlob);
    onChange(file, fileBlob);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event?.target?.files![0];

    if (selectedFile) {
      const image = new Image();

      image.onload = () => {
        if (
          sizeValidate.type === 'greaterThan'
            ? image.width >= sizeValidate.width && image.height >= sizeValidate.height
            : image.width <= sizeValidate.width && image.height <= sizeValidate.height
        ) {
          const fileBlob = URL.createObjectURL(selectedFile);
          onChange(selectedFile, fileBlob);
          setBlob(fileBlob);
        } else {
          toast.error(sizeValidate.message);
          if (targetRef.current) {
            targetRef.current.value = '';
          }
          setBlob('');
          onChange(null, '');
        }
      };

      if (!validateFileSize(selectedFile, validate.size)) {
        toast.error(validate?.sizeMessage);
        if (targetRef.current) {
          targetRef.current.value = '';
        }
        return 0;
      }

      if (!validateFileFormat(selectedFile, validate.format)) {
        toast.error(validate?.formatMessage);
        if (targetRef.current) {
          targetRef.current.value = '';
        }
        return 0;
      }

      image.src = URL.createObjectURL(selectedFile);

      if (blob) {
        URL.revokeObjectURL(blob);
      }

      const fileBlob = URL?.createObjectURL(selectedFile);
      onChange(selectedFile, fileBlob);
      setBlob(fileBlob);
    }

    return 0;
  };

  const handleClear = () => {
    setBlob('');
    onChange(null, '');
    URL.revokeObjectURL(blob);
    if (targetRef.current) {
      targetRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!!preview && typeof preview === 'string') {
      setBlob(preview);
      return;
    }

    if (!!preview && typeof preview === 'object' && preview?.type) {
      setBlob(URL.createObjectURL(preview));
      onChange(preview);
      return;
    }

    if (!preview) {
      setBlob('');
    }
  }, [preview]);

  return (
    <div className={cn(containerClassName)}>
      <div
        className={cn(
          {
            'dark:#FFFFFF26 border-1 border-[#FFFFFF26] dark:border-[#FFFFFF26]': withBorder,
          },
          `group relative flex h-full w-full items-center justify-center overflow-hidden rounded-[.5rem] bg-[#FFFFFF26] font-medium hover:cursor-pointer dark:bg-[#FFFFFF26] dark:placeholder:text-gray-400`,
          className
        )}
        onDragEnter={handleDragEnter}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onClick={(e) => {
          if (blob || disabled) {
            e.preventDefault();
          } else {
            targetRef.current?.click();
          }
        }}
      >
        {blob && (
          <NextImage.default
            fill
            className='absolute top-0 right-0 left-0 z-1 h-full w-full rounded-xl object-center'
            src={blob}
            alt=''
          />
        )}
        <div className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 w-full'>
          {blob ? (
            withClear ? (
              <HStack
                justify='center'
                className='opacity-100 transition-all duration-300 ease-linear group-hover:opacity-100 md:opacity-0'
              >
                <Button
                  disabled={disabled}
                  onClick={handleClear}
                  size={'sm'}
                  className={cn('backdrop-blur-sm dark:bg-white-custom', {
                    'h-8 px-2': isMobile,
                  })}
                >
                  <Icons.trash size={trashIconSize} />
                </Button>
              </HStack>
            ) : null
          ) : (
            <>
              {description ? (
                <VStack justify='center' align='center' spacing={8}>
                  <HStack justify='center' align='center' className='rounded-[.5rem] p-2.5 md:dark:bg-[#FD363C26]'>
                    <Icons.cloud width={20} height={20} className='stroke-gray-25' />
                  </HStack>

                  <div className='hidden space-y-1 md:block'>
                    <div className='text-center'>
                      <p className='inline font-medium text-brand-600 text-sm dark:text-brand-600'>Click to upload </p>
                      <p className='inline font-medium text-gray-25 text-sm dark:text-gray-25'>or drag and drop</p>
                    </div>
                    <div className='text-center font-medium text-gray-25 text-xs dark:text-gray-25'>{description}</div>
                  </div>
                </VStack>
              ) : (
                <div className='absolute top-0 right-0 flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black/55 opacity-0 transition-all hover:scale-125 active:scale-110 group-hover:opacity-100'>
                  <Icons.cloud className='text-gray-200' width={24} height={24} />
                </div>
              )}
            </>
          )}
        </div>

        <input
          ref={targetRef}
          type='file'
          hidden
          onChange={handleFileChange}
          accept={accept}
          className='w-full rounded border px-4 py-2 focus:border-blue-300 focus:outline-none focus:ring dark:border-gray-700 dark:bg-black dark:placeholder:text-gray-400'
        />
      </div>

      {!!besideComp && besideComp}
    </div>
  );
};

export { InputFile };
