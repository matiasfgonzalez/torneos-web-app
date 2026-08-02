-- CreateTable
CREATE TABLE "WorldFixture" (
    "fixtureId" INTEGER NOT NULL,
    "kickoff" TIMESTAMP(3) NOT NULL,
    "matchDay" TEXT NOT NULL,
    "statusShort" TEXT NOT NULL,
    "statusLong" TEXT,
    "elapsed" INTEGER,
    "leagueId" INTEGER NOT NULL,
    "leagueName" TEXT NOT NULL,
    "leagueCountry" TEXT,
    "leagueLogo" TEXT,
    "leagueFlag" TEXT,
    "leagueRound" TEXT,
    "homeTeamId" INTEGER NOT NULL,
    "homeTeamName" TEXT NOT NULL,
    "homeTeamLogo" TEXT,
    "awayTeamId" INTEGER NOT NULL,
    "awayTeamName" TEXT NOT NULL,
    "awayTeamLogo" TEXT,
    "homeGoals" INTEGER,
    "awayGoals" INTEGER,
    "venueName" TEXT,
    "venueCity" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorldFixture_pkey" PRIMARY KEY ("fixtureId")
);

-- CreateTable
CREATE TABLE "WorldFixtureSync" (
    "matchDay" TEXT NOT NULL,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL,
    "lastSuccessAt" TIMESTAMP(3),
    "fixtureCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,

    CONSTRAINT "WorldFixtureSync_pkey" PRIMARY KEY ("matchDay")
);

-- CreateTable
CREATE TABLE "ApiFootballQuota" (
    "day" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiFootballQuota_pkey" PRIMARY KEY ("day")
);

-- CreateIndex
CREATE INDEX "WorldFixture_matchDay_kickoff_idx" ON "WorldFixture"("matchDay", "kickoff");

-- CreateIndex
CREATE INDEX "WorldFixture_matchDay_statusShort_idx" ON "WorldFixture"("matchDay", "statusShort");
