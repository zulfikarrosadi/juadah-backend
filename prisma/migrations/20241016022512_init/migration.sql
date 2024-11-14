-- CreateEnum
CREATE TYPE "crdb_internal_region" AS ENUM ('gcp-asia-southeast1');

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "images" JSONB,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id_user" BIGINT NOT NULL,
    "id_product" BIGINT NOT NULL,
    "star" INTEGER NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id_user","id_product")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refresh_token" TEXT,
    "email_verified" BOOLEAN DEFAULT false,
    "verification_token" CHAR(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
