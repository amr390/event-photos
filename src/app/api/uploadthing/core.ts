import { auth } from '@clerk/nextjs';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();
const getUser = async (req: Request) => Promise.resolve({ userId: 'fakeId' });
// const getUser = async (req: NextRequest) => await getAuth(req);

// FileRouter for your app, can contain multiple FileRoutes
export const uploadThingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await getUser(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new Error('Unauthorized');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId };
    })
    .onUploadComplete(({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadThingRouter;
