SELECT name, count(distinct user_id) AS unique_viewers
FROM Views
INNER JOIN Users ON Views.user_id = Users.id
INNER JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
INNER JOIN Genres ON genre_id = Genres.id
GROUP BY genres.name
ORDER BY unique_viewers DESC
LIMIT 10