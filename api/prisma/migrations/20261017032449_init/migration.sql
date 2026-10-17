-- CreateEnum
CREATE TYPE "EngineType" AS ENUM ('SINGLE', 'PARALLEL_TWIN', 'V_TWIN', 'BOXER_TWIN', 'INLINE_THREE', 'INLINE_FOUR', 'V_FOUR');

-- CreateEnum
CREATE TYPE "CoolingType" AS ENUM ('AIR', 'AIR_OIL', 'AIR_LIQUID', 'LIQUID');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'CVT', 'DCT');

-- CreateTable
CREATE TABLE "brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motorcycles" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "price_usd" INTEGER,
    "displacement_cc" INTEGER NOT NULL,
    "engine_type" "EngineType" NOT NULL,
    "cooling" "CoolingType" NOT NULL,
    "power_hp" DOUBLE PRECISION NOT NULL,
    "power_rpm" INTEGER NOT NULL,
    "torque_nm" DOUBLE PRECISION NOT NULL,
    "torque_rpm" INTEGER NOT NULL,
    "transmission" "TransmissionType" NOT NULL,
    "gears" INTEGER,
    "weight_kg" INTEGER NOT NULL,
    "seat_height_mm" INTEGER NOT NULL,
    "fuel_capacity_l" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motorcycles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "motorcycles_slug_key" ON "motorcycles"("slug");

-- CreateIndex
CREATE INDEX "motorcycles_category_id_idx" ON "motorcycles"("category_id");

-- CreateIndex
CREATE INDEX "motorcycles_displacement_cc_idx" ON "motorcycles"("displacement_cc");

-- CreateIndex
CREATE INDEX "motorcycles_price_usd_idx" ON "motorcycles"("price_usd");

-- CreateIndex
CREATE UNIQUE INDEX "motorcycles_brand_id_name_year_key" ON "motorcycles"("brand_id", "name", "year");

-- AddForeignKey
ALTER TABLE "motorcycles" ADD CONSTRAINT "motorcycles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motorcycles" ADD CONSTRAINT "motorcycles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
