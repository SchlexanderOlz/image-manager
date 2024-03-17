import { MD5 } from "crypto-js";
import { PictureGroupUpload } from "./prisma";

export const hashUpload = (upload: PictureGroupUpload): string => {
  return MD5(Object.values(upload).join()).toString();
};