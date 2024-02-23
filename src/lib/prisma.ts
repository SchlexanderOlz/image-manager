"use server";

import { Group, PrismaClient } from "@prisma/client";
import { createWriteStream, uploadFile, uploadFiles } from "./cloud";
import * as exifParser from "exif-parser";
import * as fs from "fs";
import { url } from "inspector";

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

export const getAllImages = async (page: number, perPage: number = 50) => {
  return prisma.image.findMany({ skip: page * perPage, take: perPage });
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
      if (image.type === "image/jpeg") {
        // TODO: Fix this so it works for exif-datetime strings
        const buffer = fs.readFileSync(image.path);
        try {
          const parser = exifParser.create(buffer);
          var result = parser.parse();
        } catch (Error) {
          console.log("Invalid upload: " + image.name); // Could handle this error differently
        }
        var createTime = result.tags.CreateDate;
      }

      const url = await uploadFile(image);

      await prisma.image.create({
        data: {
          name: image.name,
          created: createTime ? new Date(createTime).toISOString() : new Date(Date.now()).toISOString(),
          group_id: group.id,
          url: url,
        },
      });
    })
  );

  await Promise.all(uploads);
};
