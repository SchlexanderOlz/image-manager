/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyWord` to the `ImageKeyword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyWord` to the `GroupKeyword` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ImageKeyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keyWord" TEXT NOT NULL,
    "image_id" INTEGER NOT NULL,
    CONSTRAINT "ImageKeyword_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ImageKeyword" ("id", "image_id") SELECT "id", "image_id" FROM "ImageKeyword";
DROP TABLE "ImageKeyword";
ALTER TABLE "new_ImageKeyword" RENAME TO "ImageKeyword";
CREATE UNIQUE INDEX "ImageKeyword_keyWord_key" ON "ImageKeyword"("keyWord");
CREATE TABLE "new_GroupKeyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keyWord" TEXT NOT NULL,
    "group_id" INTEGER NOT NULL,
    CONSTRAINT "GroupKeyword_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GroupKeyword" ("group_id", "id") SELECT "group_id", "id" FROM "GroupKeyword";
DROP TABLE "GroupKeyword";
ALTER TABLE "new_GroupKeyword" RENAME TO "GroupKeyword";
CREATE UNIQUE INDEX "GroupKeyword_keyWord_key" ON "GroupKeyword"("keyWord");
CREATE UNIQUE INDEX "GroupKeyword_group_id_key" ON "GroupKeyword"("group_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");
