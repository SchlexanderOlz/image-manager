import { Storage } from "@google-cloud/storage";
import { createReadStream } from "fs";
import { hashName } from "./adapter";
import Adapter from "./adapter";

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
    file: File,
    onProgress?: (progess: number) => void,
  ): Promise<string> => {
    const ref = bucket.file(hashName(file.name + Date.now().toString()));
    let stream = ref.createWriteStream({
      gzip: true,
      contentType: file.type,
    });

    const onChunk = onProgress ? onProgress : () => {};

    let loadedBytes: number = 0;
    return new Promise((resolve, reject) => {
      createReadStream((file as any).path)
        .on("data", (chunk) => {
          loadedBytes += chunk.length;
          onChunk(loadedBytes / file.size);
        })
        .pipe(stream)
        .on("finish", async () => {
          resolve(ref.name);
        })
        .on("unhandledRejection", (err) => {
          console.error(err.message);
          reject(err);
        })
        .on("error", (err) => {
          console.log(err.message);
          reject(err);
        });
    });
  };

  uploadFiles = async (files: File[]): Promise<string[]> => {
    console.log(bucket.baseUrl);
    let urls: string[] = [];
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
