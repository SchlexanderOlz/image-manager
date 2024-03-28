import { Storage } from "@google-cloud/storage";
import { ImageUpload, UploadResult, parseResult } from "./adapter";
import Adapter from "./adapter";
import sharp from "sharp";
import cuid from "cuid";

const projectId = process.env.BUCKET_ID!;

const storage = new Storage({
  projectId,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  },
});

const bucket = storage.bucket(process.env.BUCKET_NAME!);

class CloudAdapter implements Adapter {
  uploadFile = async (
    file: ImageUpload,
    onProgress?: (progess: number) => void,
  ): Promise<UploadResult> => {
    const ref = bucket.file(cuid());
    let stream = ref.createWriteStream({
      gzip: true,
      contentType: file.mimeType,
    });

    const onChunk = onProgress ? onProgress : () => {};
    let metaParser = sharp();

    return new Promise((resolve, reject) => {
      file.data
        .on("data", (chunk) => {
          metaParser.write(chunk);
          onChunk(chunk.length);
        })
        .pipe(stream)
        .on("finish", async () => {
          const parsed = await parseResult(metaParser);
          const result: UploadResult = {
            name: file.name,
            gcStorageName: ref.name,
            created: parsed.created,
            height: parsed.height || 0,
            width: parsed.width || 0,
          };
          resolve(result);
        })
        .on("error", (err) => {
          console.log(err.message);
          reject(err);
        })
        .on("end", () => {
          console.log("Stream ended (might be due to error)");
        });
    });
  };

  uploadFiles = async (files: ImageUpload[]): Promise<UploadResult[]> => {
    let urls: UploadResult[] = [];
    files.forEach(async (file) => {
      urls.push(await this.uploadFile(file));
    });
    return urls;
  };

  deleteFile = async (name: string) => {
    await bucket.file(name).delete();
  };

  createReadStream = async (filename: string) => {
    const ref = bucket.file(filename);
    return ref.createReadStream();
  };
}

export default CloudAdapter;
