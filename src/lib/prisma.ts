"use server";

import { Group, PrismaClient, Image } from "@prisma/client";
import LocalAdapter from "./localAdapter";
import Adapter, { UploadResult } from "./adapter";

const prisma = new PrismaClient();

export interface PictureGroupUpload {
  name: string;
  description: string;
  start: Date;
  end: Date;
  keywords: string[];
  images: UploadResult[];
  location: string;
}

export interface ImageFilterQuery {
  search: string | undefined;
  begin: Date | undefined;
  end: Date | undefined;
}

export class DBInteraction {
  adapter: Adapter;
  constructor(imageAdapter: Adapter) {
    this.adapter = imageAdapter;
  }

  makeFilter = (filter?: ImageFilterQuery) => {
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
        },
      );
    }

    if (filter?.begin || filter?.end) {
      andConditions.push({
        OR: [
          { created: { gte: filter?.begin, lte: filter?.end } },
          {
            group: { start: { gte: filter?.begin }, end: { lte: filter?.end } },
          },
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

  getImages = async (filter?: ImageFilterQuery) => {
    return await prisma.image.findMany({
      where: this.makeFilter(filter) as any,
      orderBy: {
        created: "desc",
      },
    });
  };

  getImageUrls = async (
    filter?: ImageFilterQuery,
  ): Promise<{ gcStorageName: string; height: number; width: number }[]> => {
    return await prisma.image.findMany({
      select: { gcStorageName: true, height: true, width: true },
      where: this.makeFilter(filter) as any,
      orderBy: {
        created: "desc",
      },
    });
  };

  getImageData = async (name: string) => {
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

  getImageByFileName = async (name: string) => {
    return await prisma.image.findUniqueOrThrow({
      where: {
        gcStorageName: name,
      },
    });
  };

  updateImageByFileName = async (name: string, update: Object) => {
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

  switchGroup = async (name: string, groupname: string) => {
    let group = await prisma.group.findUnique({
      where: {
        name: groupname,
      },
    });
    if (group == null) {
      group = await prisma.group.create({
        data: {
          name: groupname,
          start: new Date(Date.now()),
          end: new Date(Date.now()),
        },
      });
    }
    await prisma.image.update({
      where: {
        gcStorageName: name,
      },
      data: {
        group_id: group.id,
      },
    });
  };

  deleteImageByFileName = async (name: string) => {
    await prisma.image.delete({
      where: {
        gcStorageName: name,
      },
    });
    await this.adapter.deleteFile(name);
  };

  uploadImages = async (upload: PictureGroupUpload) => {
    const groupData = {
      name: upload.name,
      description: upload.description,
      end: upload.end,
      start: upload.start,
      location: upload.location,
    };

    let group: Group;

    let uploads: any = [];
    try {
      group = await prisma.group.create({
        data: { ...groupData, images: { create: upload.images } },
      });
    } catch (e) {
      console.log("I crashed because I am: " + e);
      group = await prisma.group.findUniqueOrThrow({
        where: {
          name: groupData.name,
        },
      });
      uploads.concat(
        upload.images.forEach(
          async (image) =>
            await prisma.image.create({
              data: {
                ...image,
                group_id: group.id,
              },
            }),
        ),
      );
    }

    if (upload.keywords) {
      uploads.concat(
        upload.keywords.map(async (keyword) => {
          await prisma.groupKeyword.create({
            data: {
              keyWord: keyword as any,
              group_id: group.id,
            },
          });
        }),
      );
    }
    await Promise.all(uploads);
  };
}
export const adapter = new LocalAdapter();
export const db = new DBInteraction(adapter);
export default prisma;
