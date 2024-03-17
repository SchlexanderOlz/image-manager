"use server";

import { Group, Prisma, PrismaClient } from "@prisma/client";
import { uploadFile, deleteFile } from "./cloud";

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

export interface ImageFilterQuery {
  search: string | undefined;
  begin: Date | undefined;
  end: Date | undefined;
}

const makeFilter = (filter?: ImageFilterQuery) => {
  const orConditions = [];
  const andConditions = [];

  if (filter?.search != undefined) {
    orConditions.push(
      { name: { contains: filter.search, mode: "insensitive" } },
      { description: { contains: filter.search, mode: "insensitive" } },
      {
        keywords: {
          some: { keyWord: { contains: filter.search, mode: "insensitive" } },
        },
      },
      { group: { name: { contains: filter.search, mode: "insensitive" } } },
      {
        group: {
          description: { contains: filter.search, mode: "insensitive" },
        },
      }
    );
  }

  if (filter?.begin || filter?.end) {
    andConditions.push({
      OR: [
        { created: { gte: filter?.begin, lte: filter?.end } },
        { group: { start: { gte: filter?.begin }, end: { lte: filter?.end } } },
      ],
    });
  }

  return {
    AND: [
      {
        OR: [...orConditions],
        AND: [...andConditions],
      },
    ],
  };
};

export const getImages = async (filter?: ImageFilterQuery) => {
  return await prisma.image.findMany({
    where: makeFilter(filter) as any,
    orderBy: {
      created: "desc",
    },
  });
};

export const getImageUrls = async (
  filter?: ImageFilterQuery
): Promise<{ gcStorageName: string; height: number; width: number }[]> => {
  return await prisma.image.findMany({
    select: { gcStorageName: true, height: true, width: true },
    where: makeFilter(filter) as any,
    orderBy: {
      created: "desc",
    },
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

export const switchGroup = async (name: string, groupname: string) => {
  let group = await prisma.group.findUnique({
    where: {
      name: groupname
    }
  })
  if (group == null) {
    group = await prisma.group.create({
      data: {
        name: groupname,
        start: new Date(Date.now()),
        end: new Date(Date.now())
      }
    })
  }
  await prisma.image.update({
    where: {
      gcStorageName: name
    },
    data: {
      group_id: group.id
    }
  })
}

export const deleteImageByFileName = async (name: string) => {
  await prisma.image.delete({
    where: {
      gcStorageName: name,
    },
  });
  await deleteFile(name);
};

export const uploadImages = async (upload: PictureGroupUpload, onProgress?: (progess: number) => void) => {
  const groupData = {
    name: upload.name,
    description: upload.description,
    end: upload.end,
    start: upload.start,
    location: upload.location,
  };

  const onData = onProgress ? onProgress : () => {}

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

  let totalSize = 0
  let uploadedSize = 0
  upload.images.forEach((image) => totalSize += image.size)
  onData(0)

  uploads.concat(
    upload.images.map(async (image) => {
      const metaData = await sharp((image as any).path).metadata();
      if (image.type == "image/jpeg") {
        const buffer = fs.readFileSync((image as any).path);
        const parser = exifParser.create(buffer);
        var result = parser.parse();
        var createTime = result.tags.CreateDate;
      }

      const height = metaData.height!;
      const width = metaData.width!;
      const impact = image.size / totalSize

      let currentProgress = 0
      const modifiedOnData = (progress: number): void => {
        currentProgress = progress * impact
        onData(uploadedSize + progress * impact)
      }
      const gcStorageName = await uploadFile(image, modifiedOnData);

      uploadedSize += currentProgress

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
