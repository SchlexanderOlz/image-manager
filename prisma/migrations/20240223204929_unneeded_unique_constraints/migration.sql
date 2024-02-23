-- DropIndex
DROP INDEX "GroupKeyword_group_id_key";

-- DropIndex
DROP INDEX "GroupKeyword_keyWord_key";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start" DATETIME,
    "end" DATETIME,
    "location" TEXT
);
INSERT INTO "new_Group" ("description", "end", "id", "location", "name", "start") SELECT "description", "end", "id", "location", "name", "start" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
