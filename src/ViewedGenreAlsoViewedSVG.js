// TODO http://jsfiddle.net/Karimjaafreh/yr6btvu5/
import React, { useState, useEffect } from 'react';

import axios from 'axios'
import SequenceSunburts from './Components/SequenceSunburts';

const ViewedGenreAlsoViewedSVG = () => {
  const [data, setData] = useState(null);
  useEffect(async () => {
    const response = (await axios.get('http://wsl:3030/usersViewedGenreAlsoViewed')).data
    setData(response)
  }, []);

  return (data ? <SequenceSunburts data={data} /> : <div>carregando</div>)
}
export default ViewedGenreAlsoViewedSVG
