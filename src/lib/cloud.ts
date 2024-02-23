import { TransferManager, Storage } from "@google-cloud/storage";
import { createReadStream } from "fs";

const projectId = "image-manager-414916"

const storage = new Storage({ projectId });
const bucket = storage.bucket(process.env.BUCKET_NAME!);

export const uploadFile = async (file: File): Promise<string> => {
  console.log(bucket.baseUrl);
  let url: string = "";
  const ref = bucket.file(file.name);
  let stream = ref.createWriteStream({
    gzip: true,
    contentType: file.type,
  });

  createReadStream(file.path)
    .pipe(stream)
    .on("finish", async () => {
      url = `https://storage.googleapis.com/${bucket.name}/${ref.name}`;
    })
    .on("unhandledRejection", (err) => {
      console.error(err.message);
    }).on("error", async (err) => console.log(err.message))
  return url;
};

export const uploadFiles = async (files: File[]): Promise<string[]> => {
  console.log(bucket.baseUrl);
  let urls: string[] = [];
  files.forEach(async (file) => {
    urls.push(await uploadFile(file));
  });
  return urls;
};
