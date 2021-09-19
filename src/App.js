import React from 'react'
import logo from './logo.svg'
import './App.css'
import PlayerPerDeviceSVG from './PlayerPerDeviceSVG'

const data = {
  name: 'devices',
  children: [
    {
      name: 'desktop',
      children: [
        { name: 'desktop', value: 130983 },
        { name: 'ios', value: 116817 },
        { name: 'mirakulo_4k', value: 50082 },
        { name: 'tv', value: 32075 },
        { name: 'mirakulo', value: 29735 },
        { name: 'android', value: 13946 },
        { name: 'sony', value: 10954 },
        { name: 'tizen', value: 6370 },
        { name: 'tvos', value: 5576 },
        { name: 'tizen_4k', value: 4068 },
        { name: 'safari', value: 2783 },
        { name: 'mirakulo_teleidea', value: 2686 },
        { name: 'tcl', value: 302 },
        { name: 'desktop_flat', value: 1 },
        { name: 'tv_hls', value: 1 },
        { name: 'tv_ss', value: 1 },
      ],
    },
    {
      name: 'tv',
      children: [
        { name: 'orsay', value: 137288 },
        { name: 'tizen_4k', value: 117976 },
        { name: 'webos_4k', value: 103221 },
        { name: 'webos', value: 92363 },
        { name: 'philips', value: 50625 },
        { name: 'panasonic', value: 17615 },
        { name: 'tcl', value: 16382 },
        { name: 'orsay_lte_2013', value: 12180 },
        { name: 'tv_dash', value: 6611 },
        { name: 'tizen', value: 6092 },
        { name: 'android', value: 2168 },
        { name: 'panasonic_4k', value: 1409 },
        { name: 'desktop', value: 136 },
        { name: 'safari', value: 2 },
        { name: 'hisense_4k', value: 1 },
        { name: 'tv_ss', value: 1 },
        { name: 'hisense', value: 1 },
      ],
    },
    {
      name: 'mobile',
      children: [
        { name: 'android', value: 7300 },
        { name: 'safari_mobile', value: 2216 },
        { name: 'safari', value: 21 },
        { name: 'android_flat', value: 6 },
        { name: 'desktop', value: 1 },
      ],
    },
    {
      name: 'tablet',
      children: [
        { name: 'android', value: 415895 },
        { name: 'safari_mobile', value: 224 },
        { name: 'desktop', value: 16 },
        { name: 'ios', value: 1 },
      ],
    },
  ],
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit
          {' '}
          <code>src/App.jsx</code>
          {' '}
          and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <PlayerPerDeviceSVG data={data} />
    </div>
  )
}

export default App
