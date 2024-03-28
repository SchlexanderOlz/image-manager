"use server";

import { Group, PrismaClient } from "@prisma/client";
import LocalAdapter from "./localAdapter";
import Adapter, { UploadResult } from "./adapter";
import { getPrisma } from "./prisma-client";

export interface PictureGroupUpload {
  name: string;
  description: string;
  start: Date;
  end: Date;
  keywords: string[];
  images: UploadResult[];
  location: string;
  email: string;
}

export interface ImageFilterQuery {
  search: string | undefined;
  begin: Date | undefined;
  end: Date | undefined;
  email: string | undefined;
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

    if (filter?.begin || filter?.end || filter?.email) {
      andConditions.push({
        AND: [
          filter.email
            ? {
                user: {
                  email: filter.email,
                },
              }
            : {},
          {
            OR: [
              filter.begin
                ? { created: { gte: filter?.begin, lte: filter?.end } }
                : {},

              filter.begin
                ? {
                    group: {
                      start: { gte: filter?.begin },
                      end: { lte: filter?.end },
                    },
                  }
                : {},
            ],
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
    return await getPrisma().image.findMany({
      where: this.makeFilter(filter) as any,
      orderBy: {
        created: "desc",
      },
    });
  };

  getImageUrls = async (
    filter?: ImageFilterQuery,
  ): Promise<{ gcStorageName: string; height: number; width: number }[]> => {
    return await getPrisma().image.findMany({
      select: { gcStorageName: true, height: true, width: true },
      where: this.makeFilter(filter) as any,
      orderBy: {
        created: "desc",
      },
    });
  };

  getImageData = async (name: string) => {
    return await getPrisma().image.findUnique({
      where: {
        gcStorageName: name,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        group: true,
        keywords: true,
      },
    });
  };

  getImageByFileName = async (name: string) => {
    return await getPrisma().image.findUniqueOrThrow({
      where: {
        gcStorageName: name,
      },
    });
  };

  updateImageByFileName = async (name: string, update: Object) => {
    return await getPrisma().image.update({
      where: {
        gcStorageName: name,
      },
      data: update,
      include: {
        user: {
          select: {
            email: true,
          },
        },
        group: true,
        keywords: true,
      },
    });
  };

  switchGroup = async (name: string, groupname: string) => {
    let group = await getPrisma().group.findUnique({
      where: {
        name: groupname,
      },
    });
    if (group == null) {
      group = await getPrisma().group.create({
        data: {
          name: groupname,
          start: new Date(Date.now()),
          end: new Date(Date.now()),
        },
      });
    }
    await getPrisma().image.update({
      where: {
        gcStorageName: name,
      },
      data: {
        group_id: group.id,
      },
    });
  };

  deleteImageByFileName = async (name: string, email: string) => {
    await getPrisma().image.delete({
      where: {
        gcStorageName: name,
        user: {
          email,
        },
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

    let prisma = getPrisma();
    let group: Group;

    let user_id = (
      await prisma.user.findUniqueOrThrow({
        where: {
          email: upload.email,
        },
      })
    ).id;
    let uploads: any = [];
    try {
      group = await prisma.group.create({
        data: {
          ...groupData,
        },
      });
    } catch (e) {
      group = await prisma.group.findUniqueOrThrow({
        where: {
          name: groupData.name,
        },
      });
    }

    uploads.concat(
      upload.images.forEach(
        async (image) =>
          await prisma.image.create({
            data: {
              ...image,
              group_id: group.id,
              user_id,
            },
          }),
      ),
    );

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
const db = new DBInteraction(adapter);
export default db;
