/*
  Warnings:

  - You are about to drop the `Keyword` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `created` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_id` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Keyword";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ImageKeyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image_id" INTEGER NOT NULL,
    CONSTRAINT "ImageKeyword_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupKeyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "group_id" INTEGER NOT NULL,
    CONSTRAINT "GroupKeyword_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created" DATETIME NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "group_id" INTEGER NOT NULL,
    CONSTRAINT "Image_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("description", "id", "name", "url") SELECT "description", "id", "name", "url" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
