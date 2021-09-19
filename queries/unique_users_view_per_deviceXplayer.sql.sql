SELECT Players.name as name, count(distinct user_id) AS unique_viewers, Devices.name as device
FROM Views
INNER JOIN Users ON Views.user_id = Users.id
INNER JOIN GenreTitles ON Views.title_id = GenreTitles.title_id
INNER JOIN Genres ON genre_id = Genres.id
INNER JOIN Players ON player_id = Players.id
INNER JOIN Devices ON device_id = Devices.id
WHERE devices.name='desktop'
GROUP BY Players.name, Devices.name
ORDER BY unique_viewers DESC