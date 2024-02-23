import { UploadThingRouter } from '@/app/api/uploadthing/core';
import { generateReactHelpers } from '@uploadthing/react/hooks';

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<UploadThingRouter>();
