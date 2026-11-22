import { UPLOAD_FOLDERS, UPLOAD_MAX_BYTES, type UploadFolder } from '@/constants/const';
import { HttpStatus } from '@/enums/enum';
import { withAdmin } from '@/lib/server/admin-session';
import { uploadImage } from '@/lib/server/storage';

/** Admin image upload: multipart `file` + `folder`. The file goes to the public bucket with the service role. */
export const POST = withAdmin(async (req) => {
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const folder = form?.get('folder');

  if (!(file instanceof File) || !UPLOAD_FOLDERS.includes(folder as UploadFolder))
    throw { status: HttpStatus.BAD_REQUEST, message: 'Expected a file and a valid folder' };
  if (file.size > UPLOAD_MAX_BYTES) throw { status: HttpStatus.PAYLOAD_TOO_LARGE, message: 'File is larger than 8 MB' };

  const uploaded = await uploadImage(folder as UploadFolder, new Uint8Array(await file.arrayBuffer()));

  return Response.json(uploaded, { status: HttpStatus.CREATED });
});
