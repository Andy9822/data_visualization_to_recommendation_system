CREATE OR REPLACE FUNCTION count_devices_per_title (int, int []) 
	RETURNS TABLE (
		total_views bigint, 
		title int
		) AS $$
	SELECT count(*) AS total_views,
		title_id
	FROM Views
		JOIN Devices ON device_id = Devices.id
	WHERE device_id = $1
		AND title_id = ANY($2)
	GROUP BY title_id
	ORDER BY total_views DESC 
$$ LANGUAGE SQL;

WITH top_10_titles AS (
    SELECT titles.id
    FROM Views
        JOIN Titles ON Views.title_id = Titles.id
    GROUP BY titles.id
    ORDER BY count(*) DESC
    LIMIT 10
)
SELECT 
    counter.total_views AS total_views,
    counter.title AS title,
    d.name as on_device
FROM 
    Devices d,
    count_devices_per_title(d.id,ARRAY(select id from top_10_titles)) AS counter;