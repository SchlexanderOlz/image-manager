"use server";

import { Group, Prisma, PrismaClient } from "@prisma/client";
import { uploadFile } from "./cloud";
import * as exifParser from "exif-parser";
import * as fs from "fs";
import sharp from "sharp";

const prisma = new PrismaClient();

export interface PictureGroupUpload {
  name: string;
  description: string;
  start: Date;
  end: Date;
  keywords: string[];
  images: File[];
  location: string;
}

export const getImages = async (page: number, perPage: number = 50) => {
  return prisma.image.findMany({ skip: page * perPage, take: perPage });
};

export const getImageUrls = async (
  page: number,
  perPage: number = 50
): Promise<{ gcStorageName: string; height: number; width: number }[]> => {
  return await prisma.image.findMany({
    skip: page * perPage,
    take: perPage,
    select: { gcStorageName: true, height: true, width: true },
  });
};

export const getImageData = async (name: string) => {
  return await prisma.image.findUnique({
    where: {
      gcStorageName: name,
    },
    include: {
      group: true,
      keywords: true,
    },
  });
};

export const getImageByFileName = async (name: string) => {
  return await prisma.image.findUniqueOrThrow({
    where: {
      gcStorageName: name,
    },
  });
};

export const updateImageByFileName = async (name: string, update: Object) => {
  return await prisma.image.update({
    where: {
      gcStorageName: name,
    },
    data: update,
    include: {
      group: true,
      keywords: true,
    },
  });
};

export const uploadImages = async (upload: PictureGroupUpload) => {
  const groupData = {
    name: upload.name,
    description: upload.description,
    end: upload.end,
    start: upload.start,
    location: upload.location,
  };

  let group: Group;
  try {
    group = await prisma.group.create({
      data: groupData,
    });
  } catch (Error) {
    group = await prisma.group.findUniqueOrThrow({
      where: {
        name: groupData.name,
      },
    });
  }

  let uploads: any = [];
  if (upload.keywords) {
    uploads.concat(
      upload.keywords.map(async (keyword) => {
        await prisma.groupKeyword.create({
          data: {
            keyWord: keyword as any,
            group_id: group.id,
          },
        });
      })
    );
  }

  uploads.concat(
    upload.images.map(async (image) => {
      const metaData = await sharp(image.path).metadata();
      if (image.type == "image/jpeg") {
        const buffer = fs.readFileSync(image.path);
        const parser = exifParser.create(buffer);
        var result = parser.parse();
        var createTime = result.tags.CreateDate;
      }

      const height = metaData.height!;
      const width = metaData.width!;
      const gcStorageName = await uploadFile(image);

      await prisma.image.create({
        data: {
          name: image.name,
          created: createTime
            ? new Date(createTime).toISOString()
            : new Date(Date.now()).toISOString(),
          group_id: group.id,
          gcStorageName,
          height,
          width,
        },
      });
    })
  );

  await Promise.all(uploads);
};

export default prisma;
