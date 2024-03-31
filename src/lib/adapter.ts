import internal from "stream";
import { createHash } from "crypto";
import { Sharp } from "sharp";
import * as exifParser from "exif-parser";

export const hashName = (name: string) => {
  const hash = createHash("sha1");
  hash.update(name);
  return hash.digest("hex").substring(0, 16);
};

export interface ImageUpload {
  data: internal.Readable;
  name: string;
  mimeType: string;
}

export interface UploadResult {
  name: string;
  gcStorageName: string;
  created: Date;
  height: number;
  width: number;
}

interface Adapter {
  uploadFile(
    file: ImageUpload,
    onProgress?: (progess: number) => void,
  ): Promise<UploadResult>;
  uploadFiles(files: ImageUpload[]): Promise<UploadResult[]>;
  deleteFile(name: string): Promise<void>;
  createReadStream(filename: string): Promise<internal.Readable>;
}

export const parseResult = async (
  metaParser: Sharp,
): Promise<{
  created: Date;
  height: number | undefined;
  width: number | undefined;
}> => {
  const meta = await metaParser.metadata();
  let createTime = new Date();
  if (meta.exif) {
    const parser = exifParser.create(
      await metaParser.withMetadata().toBuffer(),
    );
    const result = parser.parse();
    if (result.tags.CreateDate) {
      createTime = new Date(result.tags.CreateDate * 1000);
    } else if (result.tags.DateTimeOriginal) {
      createTime = new Date(result.tags.DateTimeOriginal * 1000);
    } else if (result.tags.DateTaken) {
      createTime = new Date(result.tags.DateTimeOriginal * 1000);
    }
  }
  return {
    created: createTime,
    height: meta.height,
    width: meta.width,
  };
};

export default Adapter;
