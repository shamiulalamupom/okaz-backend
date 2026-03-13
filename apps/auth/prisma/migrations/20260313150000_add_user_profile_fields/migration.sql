ALTER TABLE "User"
ADD COLUMN "nom" TEXT,
ADD COLUMN "prenom" TEXT,
ADD COLUMN "telephone" TEXT,
ADD COLUMN "adresse_livraison" TEXT,
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
