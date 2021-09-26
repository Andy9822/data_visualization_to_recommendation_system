-- sem inequaçao, ignorando o campo usado como base na hierarquia pra aproveitar hash index

select count(distinct user_id) as unique_viewers_ids, genres.name
FROM Views
JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
JOIN Genres on GenreTitles.genre_id = Genres.id
WHERE genre_id != 1 AND user_id in 
	(
	SELECT distinct user_id
	FROM Views
	JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
	WHERE genre_id = 1
	GROUP BY genre_id, user_id
	)
GROUP BY genres.id
ORDER BY unique_viewers_ids DESC

-- select count(distinct user_id) as unique_viewers_ids, genres.name
-- FROM Views
-- JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
-- JOIN Genres on GenreTitles.genre_id = Genres.id
-- GROUP BY genres.id
-- ORDER BY unique_viewers_ids DESC

-- WITH drama_views AS (
--     SELECT distinct user_id
--     FROM Views
--     JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
--     WHERE genre_id = 3
--     GROUP BY genre_id, user_id
-- )
-- SELECT 
--     count(distinct user_id) AS unique_viewers_ids,
--     cast(count(distinct user_id) as float) / (SELECT count(drama_views.user_id) from drama_views) AS fraction,
--     genres.name
-- FROM Views
-- JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
-- JOIN Genres on GenreTitles.genre_id = Genres.id
-- WHERE genre_id !=3 AND user_id in (select user_id from drama_views)
-- GROUP BY genres.id
-- ORDER BY unique_viewers_ids DESC