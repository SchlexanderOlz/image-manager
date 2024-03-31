import { Readable } from "stream";
import Adapter, { ImageUpload, UploadResult, parseResult } from "./adapter";
import fs from "fs";
import sharp from "sharp";
import cuid from "cuid";

const dataDir: string = process.env.DATA_DIR!;
class LocalAdapter implements Adapter {
  path: string;
  constructor() {
    if (dataDir.at(dataDir.length - 1) != "/") this.path = dataDir.concat("/");
    else this.path = dataDir;
  }
  uploadFile = async (
    file: ImageUpload,
    onProgress?: ((progess: number) => void) | undefined,
  ): Promise<UploadResult> => {
    const name = cuid();
    let stream = fs.createWriteStream(this.path + name);
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
          console.log("Finished upload");
          metaParser = metaParser.end();
          const parsed = await parseResult(metaParser);
          const result: UploadResult = {
            name: file.name,
            gcStorageName: name,
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

  deleteFile = async (name: string): Promise<void> => {
    return new Promise((resolve, reject) =>
      fs.rm(this.path + name, (err) => {
        if (err) reject(err);
        else resolve();
      }),
    );
  };

  createReadStream = async (filename: string): Promise<Readable> => {
    return fs.createReadStream(this.path + filename);
  };
}

export default LocalAdapter;
