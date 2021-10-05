CREATE OR REPLACE FUNCTION count_players_per_device (int)
    RETURNS TABLE (
        total_views bigint,
		name varchar
    )
    AS $$
    SELECT
        count(*) AS total_views,
		Players.name
    FROM
        Views
        JOIN Players ON player_id = Players.id
        JOIN Devices ON device_id = Devices.id
	WHERE
		device_id = $1 
    GROUP BY
        Players.name
    ORDER BY
        total_views DESC
$$
LANGUAGE SQL;


SELECT
    counter.total_views AS total_views,
	counter.name AS player,
    d.name as on_device
FROM Devices d, count_players_per_device(d.id) AS counter;