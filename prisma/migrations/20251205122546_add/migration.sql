-- CreateTable
CREATE TABLE "ScrollTopSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT '#28A745',
    "hoverColor" TEXT NOT NULL DEFAULT '#1C7530',
    "iconColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "buttonShape" TEXT NOT NULL DEFAULT 'circle',
    "buttonPosition" TEXT NOT NULL DEFAULT 'right',
    "showOnHome" BOOLEAN NOT NULL DEFAULT false,
    "showOnProduct" BOOLEAN NOT NULL DEFAULT false,
    "showOnCollection" BOOLEAN NOT NULL DEFAULT false,
    "showOnAll" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrollTopSettings_shop_key" ON "ScrollTopSettings"("shop");
