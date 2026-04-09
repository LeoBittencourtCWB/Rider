-- Permitir que event_end_time seja nulo
ALTER TABLE events ALTER COLUMN event_end_time DROP NOT NULL;

-- Recriar a view para refletir a mudança
DROP VIEW IF EXISTS events_with_count;
CREATE VIEW events_with_count AS
SELECT
    e.*,
    p.user_name  AS creator_name,
    p.user_picture AS creator_picture,
    COALESCE(r.cnt, 0)::int AS participant_count
FROM events e
JOIN profiles p ON p.user_id = e.created_by
LEFT JOIN (
    SELECT event_id, COUNT(*) AS cnt
    FROM event_registrations
    GROUP BY event_id
) r ON r.event_id = e.event_id;
