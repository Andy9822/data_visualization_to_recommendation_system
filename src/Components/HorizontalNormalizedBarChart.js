/* eslint-disable no-restricted-syntax */
/* eslint-disable func-names */
/* eslint-disable react/no-this-in-sfc */
import React, { useRef, useState, useEffect } from 'react'
import * as d3 from 'd3'
import { legend } from './Legend'

const xaya = [
  {
    name: 'Ficção', android: '598478', tv: '174781', desktop: '625599', mobile: '316598',
  },
  {
    name: 'Policial', android: '690830', tv: '5354112', desktop: '99926', mobile: '638789',
  },
  {
    name: 'Reggaeton', android: '1363631', tv: '1421557', desktop: '1357210', mobile: '528108',
  },
]
xaya.columns = ['name', 'android', 'tv', 'desktop', 'mobile']

const HorizontalNormalizedBarChart = ({ data }) => {
  const svgRef = useRef(null)
  const legendRef = useRef(null)
  const [andy, setAndy] = useState(null)

  useEffect(async () => {
    const margin = ({
      top: 30, right: 30, bottom: 0, left: 100,
    })
    // console.log('xaya (old data)');
    // console.log(xaya);
    // console.log('data');
    // console.log(data);

    const height = data.length * 25 + margin.top + margin.bottom
    const formatValue = (x) => {
      if (!x) x = 0
      return Number.isNaN(x) ? 'N/A' : x.toLocaleString('en')
    }
    const formatPercent = d3.format('.1%')

    const series = d3.stack()
      .keys(data.columns.slice(1))
      .offset(d3.stackOffsetExpand)(data)
      .map((d) => (d.forEach((v) => v.key = d.key), d))

    // console.log('series');
    // console.log(series);

    const x = d3.scaleLinear()
      .range([margin.left, svgRef.current.width.baseVal.value - margin.right])

    const y = d3.scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.08)

    const yAxis = (g) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .call((g) => g.selectAll('.domain').remove())

    const xAxis = (g) => g
      .attr('transform', `translate(0,${margin.top})`)
      .call(d3.axisTop(x).ticks(svgRef.current.width.baseVal.value / 100, '%'))
      .call((g) => g.selectAll('.domain').remove())

    const columnNames = data.columns.filter((name) => name !== 'name')
    const color = d3.scaleOrdinal(columnNames, d3.quantize(d3.interpolateRainbow, data.columns.length))

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    svg.append('g')
      .selectAll('g')
      .data(series)
      .enter()
      .append('g')
      .attr('fill', (d) => color(d.key))
      .selectAll('rect')
      .data((d) => d)
      .join('rect')
      .attr('x', (d) => x(d[0]))
      .attr('y', (d, i) => y(d.data.name))
      .attr('width', (d) => x(d[1]) - x(d[0]))
      .attr('height', y.bandwidth())
      .append('title')
      .text((d) => {
        // console.log(`d.data.name: ${d.data.name} d.key:${d.key} d.data[d.key]:${d.data[d.key]}`)
        const a = 5
        return `${d.data.name} ${d.key}
        ${formatPercent(d[1] - d[0])} (${formatValue(d.data[d.key])})`
      })

    svg.append('g')
      .call(xAxis);

    svg.append('g')
      .call(yAxis);

    const legenda = legend({
      title: 'Device', color, tickSize: 4, width: 1440, marginLeft: 20,
    })

    if (legendRef.current.lastChild) legendRef.current.removeChild(legendRef.current.lastChild)
    legendRef.current.appendChild(legenda)

    setTimeout(() => { setAndy(24) }, 1)
  }, [andy])

  return (
    <>
      <div ref={legendRef} />
      <svg ref={svgRef} style={{ height: '960px', width: '100%' }} />
    </>
  )
}

export default HorizontalNormalizedBarChart
