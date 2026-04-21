-- 1. Check if the old SecurityEvent table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'securityevent'
    ) THEN
        -- 2. Rename old table to temporary backup
        ALTER TABLE "SecurityEvent" RENAME TO "SecurityEvent_old";
    END IF;
END $$;

-- 3. Create the new unified SecurityEvent table
CREATE TABLE IF NOT EXISTS "SecurityEvent" (
    id TEXT PRIMARY KEY,
    version INT DEFAULT 3,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    category TEXT,
    context TEXT,
    source TEXT,
    requestId TEXT,

    actorType TEXT NOT NULL,
    actorId TEXT,

    orderId TEXT,
    fulfillmentId TEXT,
    riderId TEXT,

    riskScore INT DEFAULT 0,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    ip TEXT,
    userAgent TEXT,
    metadata JSONB,

    timestamp TIMESTAMP DEFAULT NOW(),
    createdAt TIMESTAMP DEFAULT NOW()
);

-- 4. Migrate old data if the backup table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'SecurityEvent_old'
    ) THEN
        INSERT INTO "SecurityEvent" (
            id,
            version,
            type,
            message,
            severity,
            category,
            context,
            source,
            requestId,
            actorType,
            actorId,
            ip,
            userAgent,
            metadata,
            timestamp,
            createdAt
        )
        SELECT
            id,
            1 AS version,
            type,
            COALESCE(message, type) AS message,
            severity,
            NULL AS category,
            NULL AS context,
            NULL AS source,
            NULL AS requestId,
            actorType,
            actorId,
            ip,
            userAgent,
            metadata,
            createdAt AS timestamp,
            createdAt
        FROM "SecurityEvent_old";
    END IF;
END $$;

-- 5. Drop the old table
DROP TABLE IF EXISTS "SecurityEvent_old";

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_securityevent_type ON "SecurityEvent"(type);
CREATE INDEX IF NOT EXISTS idx_securityevent_severity ON "SecurityEvent"(severity);
CREATE INDEX IF NOT EXISTS idx_securityevent_category ON "SecurityEvent"(category);
CREATE INDEX IF NOT EXISTS idx_securityevent_actorType ON "SecurityEvent"(actorType);
CREATE INDEX IF NOT EXISTS idx_securityevent_actorId ON "SecurityEvent"(actorId);
CREATE INDEX IF NOT EXISTS idx_securityevent_orderId ON "SecurityEvent"(orderId);
CREATE INDEX IF NOT EXISTS idx_securityevent_fulfillmentId ON "SecurityEvent"(fulfillmentId);
CREATE INDEX IF NOT EXISTS idx_securityevent_riderId ON "SecurityEvent"(riderId);
CREATE INDEX IF NOT EXISTS idx_securityevent_timestamp ON "SecurityEvent"(timestamp);
