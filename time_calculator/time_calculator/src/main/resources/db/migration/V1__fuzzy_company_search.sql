-- =============================================================================
-- V1__fuzzy_company_search.sql
-- Non-destructive: adds extension, a helper function, and two indexes.
-- Does NOT alter any table or drop anything.
-- =============================================================================

-- ─── 1. Enable trigram extension (requires superuser once per DB) ─────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── 2. Normalisation helper function ────────────────────────────────────────
--  Strips:  legal prefixes / suffixes (PT, CV, TBK, PERSERO, INACTIVE)
--           non-alphanumeric characters  (_ - , . ( ) etc.)
--           redundant whitespace
--  Lowercases the result.
--
--  Examples:
--    normalize_company('PT Bank Mandiri (Persero) Tbk') → 'bank mandiri'
--    normalize_company('INACTIVE - Bank Mandiri')        → 'bank mandiri'
--    normalize_company('Mandiri_B24')                    → 'mandiri b24'
--    normalize_company('CV Gala Mandiri')                → 'gala mandiri'
-- =============================================================================
CREATE OR REPLACE FUNCTION normalize_company(raw TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT TRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    LOWER(raw),
                    '\y(pt|cv|tbk|persero|inactive)\y',   -- whole-word match
                    '',
                    'g'
                ),
                '[^a-z0-9 ]',    -- remove symbols: _ - , . ( ) etc.
                ' ',
                'g'
            ),
            '\s+',              -- collapse multiple spaces
            ' ',
            'g'
        )
    )
$$;

-- ─── 3. Functional index on res_partner.name ─────────────────────────────────
--  Supports both the dropdown search AND the dashboard filter query.
--  The trigram index (GIN) lets PostgreSQL use similarity operators efficiently.
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_res_partner_name_normalized_trgm
ON res_partner
USING GIN (normalize_company(name) gin_trgm_ops);

-- Plain B-tree index for ILIKE '%...%' fallback if trigram similarity is unused
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_res_partner_name_lower
ON res_partner (LOWER(name));

-- ─── 4. Quick smoke-test query (run manually to verify) ──────────────────────
/*
SELECT
    rp.name                                 AS raw_name,
    normalize_company(rp.name)             AS normalized,
    normalize_company('Bank Mandiri (Persero) Tbk') AS search_normalized,
    SIMILARITY(
        normalize_company(rp.name),
        normalize_company('Bank Mandiri (Persero) Tbk')
    )                                       AS sim_score
FROM res_partner rp
WHERE
    normalize_company(rp.name) ILIKE '%' || normalize_company('Bank Mandiri (Persero) Tbk') || '%'
   OR
    SIMILARITY(normalize_company(rp.name), normalize_company('Bank Mandiri (Persero) Tbk')) > 0.2
ORDER BY sim_score DESC;
*/
