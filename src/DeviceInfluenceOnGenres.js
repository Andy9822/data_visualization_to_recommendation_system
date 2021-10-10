import React from 'react'
import Chord from './Chord'
import ChordNormalized from './ChordNormalized'

const DeviceInfluenceOnGenres = ({ normalized }) => (normalized ? <ChordNormalized /> : <Chord />)

export default DeviceInfluenceOnGenres
