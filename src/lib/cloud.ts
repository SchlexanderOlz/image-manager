import { TransferManager, Storage } from "@google-cloud/storage";

const storage = new Storage();

const bucket = storage.bucket(process.env.BUCKET_NAME!);

export const uploadFile = async (file: File): Promise<string> => {
  console.log(bucket.baseUrl);
  let url: string = "";
  const blob = bucket.file(file.name);
  const blobStream = blob.createWriteStream();

  blobStream.on("finish", async () => {
    url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  });

  blobStream.on("unhandledRejection", (err) => {
    console.error(err.message);
  });

  blobStream.end(await file.arrayBuffer());
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

export const createWriteStream = (filename: string, contentType?: string) => {
    const ref = bucket.file(filename);

    const stream = ref.createWriteStream({
        gzip: true,
        contentType: contentType,
    });

    return stream;
};