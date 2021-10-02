CREATE OR REPLACE FUNCTION count_except_category (int)
    RETURNS TABLE (
        unique_viewers_ids bigint,
        name varchar
    )
    AS $$
    SELECT
        count(DISTINCT user_id) AS unique_viewers_ids,
        genres.name
    FROM
        Views
        JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
        JOIN Genres ON GenreTitles.genre_id = Genres.id
    WHERE
        genre_id != $1
        AND user_id IN ( SELECT DISTINCT
                user_id
            FROM
                Views
                JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
            WHERE
                genre_id = $1
            GROUP BY
                genre_id,
                user_id)
    GROUP BY
        genres.id
    ORDER BY
        unique_viewers_ids DESC
$$
LANGUAGE SQL;

SELECT
    counter.unique_viewers_ids AS unique_viewers,
    g.name as viewed,
	counter.name AS also_viewed
FROM Genres g, count_except_category(g.id) AS counter;