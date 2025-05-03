import { useServices } from '@/services';
import { useMutation } from '@tanstack/react-query';

interface UploadMediaOptions {
  onSuccess?: (result: { id: string; url: string }) => void;
  onError?: (error: Error) => void;
}

export function useUploadMedia(options?: UploadMediaOptions) {
  const { MediaService } = useServices();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const result = await MediaService.upload(file);
      return result;
    },
    onError: options?.onError,
    onSuccess: options?.onSuccess,
  });

  return {
    upload: mutateAsync,
    isUploading: isPending,
  };
}
