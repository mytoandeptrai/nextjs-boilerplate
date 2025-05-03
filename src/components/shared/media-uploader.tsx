'use client';
import React, { useRef } from 'react';
import { Button } from '../ui/button';
import { Upload, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUploadMedia } from '@/hooks/media/use-upload-media';

type MediaUploaderProps = {
  onChange?: (result: { id: string; url: string }) => void;
};

export function MediaUploader({ onChange }: MediaUploaderProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useUploadMedia();

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const result = await upload(file);
    onChange?.(result);
  };

  return (
    <>
      <Button type='button' variant='outline' onClick={handleUpload} disabled={isUploading}>
        {isUploading ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : <Upload className='mr-2 h-4 w-4' />}
        {t('common.upload')}
      </Button>
      <input ref={fileInputRef} className='hidden' type='file' onChange={handleChange} accept='image/jpeg,image/png' />
    </>
  );
}
