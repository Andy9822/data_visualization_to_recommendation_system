const express = require('express')
const cors = require('cors')
const { Client } = require('pg')

const app = express()
const port = 3030
const db = new Client({
  user: 'andy', host: '127.0.0.1', database: 'postgres', password: 'oi',
})
db.connect()

const cache = {}

app.use(cors())

app.get('/usersViewedGenreAlsoViewed', async (req, res) => {
  if (!cache.usersViewedGenreAlsoViewed) {
    const { rows } = await db.query(`
    SELECT
      counter.unique_viewers_ids AS unique_viewers,
      g.name as viewed,
      counter.name AS also_viewed
    FROM Genres g, count_except_category(g.id, 15) AS counter;
    `)
    const rowsByGenre = rows.reduce((acc, { unique_viewers, viewed, also_viewed }) => {
      if (!acc[viewed]) acc[viewed] = { name: viewed, children: [] }
      const value = parseInt(unique_viewers, 10)
      acc[viewed].children.push({ name: `${also_viewed} (${value})`, value })
      return acc
    }, {})

    const processedRows = Object.keys(rowsByGenre)
      .map((genre) => (rowsByGenre[genre]))

    cache.usersViewedGenreAlsoViewed = { name: 'genres', children: processedRows }
  }
  res.send(cache.usersViewedGenreAlsoViewed)
})

app.get('/devicesPerTitles', async (req, res) => {
  if (!cache.devicesPerTitles) {
    const { rows } = await db.query(`
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
    `)

    const processed = rows.reduce((acc, { total_views, title, on_device }) => {
      if (!acc[title]) acc[title] = {}
      // if (!acc[devices]) acc[devices] = {}
      const value = parseInt(total_views, 10)
      acc[title][on_device] = ({ value })
      return acc
    }, {})

    const result = []
    const devices = ['tv', 'tablet', 'desktop', 'mobile']

    devices.forEach((device, deviceIndex) => {
      const bar = { name: device, values: [] }
      Object.keys(processed).forEach((film, filmIndex) => {
        const y0 = result.at(-1) ? result.at(-1).values[filmIndex].y + result.at(-1).values[filmIndex].y0 : 0
        bar.values.push({
          x: filmIndex,
          y: processed[film][device].value,
          y0,
        })
      })
      result.push(bar)
    })

    cache.devicesPerTitles = result
    console.log(rows)
  }
  res.send(cache.devicesPerTitles)
})

app.get('/deviceInfluenceOnGenres', async (req, res) => {
  if (!cache.playerInfluenceOnGenre) {
    const { rows } = await db.query(`
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
    ORDER BY on_player;`)

    const processedRowsChord = rows
      .reduce((acc, { total_views, genre, on_player }) => {
        // Add to .chord in the expected structured form
        acc.chord.push({ source: on_player, target: genre, value: total_views })

        // Sum of players views
        acc.playersCount[on_player] = acc.playersCount[on_player]
          ? acc.playersCount[on_player] + parseInt(total_views, 10)
          : parseInt(total_views, 10)

        // Prepare in the format for the stacked version
        acc.bar[genre] = { ...acc.bar[genre], name: genre, [on_player]: total_views }

        // Utility to be able to retrieve all different players name
        acc.players[on_player] = null

        return acc
      }, {
        chord: [],
        bar: {},
        playersCount: {},
        players: {},
      })

    // Change the structure to match the expected format by the stacked chart
    processedRowsChord.processedBar = Object.entries(processedRowsChord.bar).map(([key, value]) => {
      const objeto = {}
      Object.entries(value).forEach(([key, value]) => {
        // Normalize values for each player
        if (key === 'name') { objeto.name = value } else { objeto[key] = String(parseInt((value / processedRowsChord.playersCount[key]) * 100, 10)) }
      })
      return objeto
    })

    // Players names list
    const columns = ['name', ...Object.keys(processedRowsChord.players).map((key) => key)]

    cache.playerInfluenceOnGenre = {
      chord: processedRowsChord.chord,
      bar: processedRowsChord.processedBar,
      columns,
    }
  }
  res.send(cache.playerInfluenceOnGenre)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
