import {
  r2AccessId,
  r2AccessKey,
  r2AccountId,
  r2bucket,
  resendSecret,
} from "@/config";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Resend } from "resend";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessId,
    secretAccessKey: r2AccessKey,
  },
});

export const uploadToR2 = async ({
  buffer,
  key,
  contentType = "image/webp",
}: {
  buffer: Buffer;
  key: string;
  contentType?: string;
}) => {
  const upload = await r2.send(
    new PutObjectCommand({
      Bucket: r2bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return upload;
};

export const deleteR2 = async (key: string) => {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: r2bucket,
      Key: key,
    })
  );
};

export const resend = new Resend(resendSecret);
