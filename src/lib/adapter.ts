import internal from "stream";
import { createHash } from "crypto";

export const hashName = (name: string) => {
  const hash = createHash("sha1");
  hash.update(name);
  return hash.digest("hex").substring(0, 16);
};

interface Adapter {
  uploadFile(
    file: File,
    onProgress?: (progess: number) => void,
  ): Promise<string>;
  uploadFiles(files: File[]): Promise<string[]>;
  deleteFile(name: string): Promise<void>;
  createReadStream(filename: string): Promise<internal.Readable>;
}

export default Adapter;
