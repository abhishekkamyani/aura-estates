import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

/**
 * UploadThing file routes. Only signed-in agency users may upload listing
 * photography. Files are stored in the UploadThing bucket tied to UPLOADTHING_TOKEN.
 */
export const ourFileRouter = {
  propertyImages: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 12,
    },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("You must be signed in to upload images.");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Returned data is sent to the client-side `onClientUploadComplete` callback.
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
