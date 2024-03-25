import { Readable } from "stream";
import Adapter, { hashName } from "./adapter";
import fs, { createReadStream } from "fs";

const dataDir: string = process.env.DATA_DIR!;
class LocalAdapter implements Adapter {
  path: string;
  constructor() {
    if (dataDir.at(dataDir.length - 1) != "/") this.path = dataDir.concat("/");
    else this.path = dataDir;
  }
  uploadFile = async (
    file: File,
    onProgress?: ((progess: number) => void) | undefined,
  ): Promise<string> => {
    const name = hashName(file.name + Date.now().toString());
    let stream = fs.createWriteStream(this.path + name);
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
          resolve(name);
        })
        .on("error", (err) => {
          console.log(err.message);
          reject(err);
        });
    });
  };

  uploadFiles = async (files: File[]): Promise<string[]> => {
    let urls: string[] = [];
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
