import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Chord from '../Chord'
import HorizontalNormalizedBarChart from '../Components/HorizontalNormalizedBarChart'

const PlayerInfluenceOnGenres = () => {
  const [data, setData] = useState(null)
  const [chartType, setChartType] = useState('default')

  const handleChangeSelect = (event) => {
    setChartType(event.target.value);
  }
  useEffect(async () => {
    const response = await (await axios.get('http://wsl:3030/deviceInfluenceOnGenres')).data
    response.bar.columns = response.columns
    setData(response)
    // console.log(response);
  }, []);

  if (!data) return null

  return (
    <>
      <div onChange={handleChangeSelect}>
        <input selected type="radio" value="default" name="gender" checked={chartType === 'default'} />
        Influência dos usuários de cada dispostivio
        <input type="radio" value="normalized" name="gender" checked={chartType === 'normalized'} />
        Influência proporiconal dos usuários de cada dispostivio
      </div>
      {chartType === 'default'
        ? <Chord data={data.chord} />
        : <HorizontalNormalizedBarChart data={data.bar} />}
    </>
  )
}

export default PlayerInfluenceOnGenres
