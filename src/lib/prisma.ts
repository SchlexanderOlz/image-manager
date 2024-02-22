'use server'

import { PrismaClient } from '@prisma/client';
import { uploadFile, uploadFiles } from './cloud';
import * as exifParser from "exif-parser"
import { createReadStream } from 'fs';

const prisma = new PrismaClient();


export interface PictureGroupUpload {
    groupName: string 
    description: string
    keywords: string[]
    images: File[]
}

export const getAllImages = async (page: number, perPage: number = 50) => {
    return prisma.image.findMany({ skip: page * perPage, take: perPage})
}


export const uploadImages = async (upload: PictureGroupUpload) => {
    upload.images.forEach(image => {
        const buffer = image.arrayBuffer(); // TODO: Add correct adding of image-contents
        const parser = exifParser.create(buffer);
        const result = parser.parse();

        const url = uploadFile(image)
        const createTime = result.tags.CreateDate
        console.log(url)
        console.log('Creation Time:', result.tags.CreateDate);
    })
}

