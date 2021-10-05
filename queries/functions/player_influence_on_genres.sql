CREATE OR REPLACE FUNCTION count_player_influence_on_genres (int, int[])
    RETURNS TABLE (
        total_views bigint,
		name varchar
    )
    AS $$
    SELECT 
        CAST(SUM(subquery.total_views) AS bigint) AS total_views,
        CASE WHEN subquery.position_top_10 = 0 THEN 'Other' ELSE STRING_AGG(subquery.name, '') END AS name
    FROM (
            SELECT
            count(*) AS total_views,
            genres.name,
            CASE WHEN genres.id = ANY($2) THEN genres.id ELSE 0 END AS position_top_10
        FROM
            Views
            JOIN Players ON Views.player_id = Players.id
            JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
            JOIN Genres ON GenreTitles.genre_id = Genres.id
        WHERE
            player_id = $1
        GROUP BY
            genres.name,
            genres.id
    ) AS subquery
    GROUP BY
        subquery.position_top_10
    ORDER BY total_views DESC
$$
LANGUAGE SQL;

WITH top_10_categories AS (
    SELECT genres.id
	FROM Views
	JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
	JOIN Genres ON GenreTitles.genre_id = Genres.id
	GROUP BY genres.id, genres.name
	ORDER BY
    count(*) DESC
	LIMIT 10
)
SELECT
    counter.total_views AS total_views,
	counter.name AS genre,
    p.name as on_player
FROM 
    Players p,
    count_player_influence_on_genres(p.id, ARRAY(select id from top_10_categories)) AS counter
ORDER BY on_player;