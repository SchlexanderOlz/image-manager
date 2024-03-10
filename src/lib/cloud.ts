import { TransferManager, Storage } from "@google-cloud/storage";
import { createReadStream } from "fs";
import { createHash } from "crypto";

const projectId = process.env.BUCKET_ID!;

const storage = new Storage({ projectId });
const bucket = storage.bucket(process.env.BUCKET_NAME!);

const hashName = (name: string) => {
  	const hash = createHash("sha1")
    hash.update(name)
    return hash.digest("hex").substring(0, 16)
}

export const uploadFile = async (file: File): Promise<string> => {
  const ref = bucket.file(hashName(file.name + Date.now().toString()));
  let stream = ref.createWriteStream({
    gzip: true,
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    createReadStream(file.path)
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

export const uploadFiles = async (files: File[]): Promise<string[]> => {
  console.log(bucket.baseUrl);
  let urls: string[] = [];
  files.forEach(async (file) => {
    urls.push(await uploadFile(file));
  });
  return urls;
};

export const deleteFile = async (name: string) => {
  bucket.file(name).delete()
}


export const createBucketReadStream = async (filename: string) => {
  const ref = bucket.file(filename);
  return ref.createReadStream()
}