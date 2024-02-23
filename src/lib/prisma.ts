"use server";

import { PrismaClient } from "@prisma/client";
import { createWriteStream, uploadFile, uploadFiles } from "./cloud";
import * as exifParser from "exif-parser";
import * as fs from "fs";

const prisma = new PrismaClient();

export interface PictureGroupUpload {
  groupName: string;
  description: string;
  keywords: string[];
  images: File[];
}

export const getAllImages = async (page: number, perPage: number = 50) => {
  return prisma.image.findMany({ skip: page * perPage, take: perPage });
};

export const uploadImages = async (upload: PictureGroupUpload) => {
  const uploads = upload.images.map(async (image) => {
    if (image.type === "image/jpeg") {
      const buffer = fs.readFileSync(image.path);
      try {
        const parser = exifParser.create(buffer);
        var result = parser.parse();
      } catch (Error) {
        console.log("Invalid upload: " + image.name); // Could handle this error differently
      }
      const createTime = result.tags.CreateDate;
    }

    const url = await uploadFile(image);
  });
  await Promise.all(uploads);
};
