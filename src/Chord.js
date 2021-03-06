/* eslint-disable no-restricted-syntax */
/* eslint-disable func-names */
/* eslint-disable react/no-this-in-sfc */
import React from 'react'
import * as d3 from 'd3'

const PlayerPerDeviceSVG = ({ data }) => {
  const svgRef = React.useRef(null)
  const svgWidth = 960
  const svgHeight = 960
  const innerRadius = Math.min(svgWidth, svgHeight) * 0.5 - 90
  const outerRadius = innerRadius + 10

  React.useEffect(() => {
    const ribbon = d3.ribbonArrow()
      .radius(innerRadius - 1)
      .padAngle(1 / innerRadius)

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)

    const chord = d3.chordDirected()
      .padAngle(10 / innerRadius)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)

    const names = Array.from(new Set(data.flatMap((d) => [d.source, d.target]))).sort(d3.ascending)

    const color = d3.scaleOrdinal(names, d3.quantize(d3.interpolateRainbow, names.length))
    const index = new Map(names.map((name, i) => [name, i]));
    const matrix = Array.from(index, () => new Array(names.length).fill(0));

    for (const { source, target, value } of data) matrix[index.get(source)][index.get(target)] += value; /* eslint-disable-line max-len */

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [-svgWidth / 2, -svgHeight / 2, svgWidth, svgHeight]);

    const chords = chord(matrix);

    const group = svg.append('g')
      .attr('font-size', 10)
      .attr('font-family', 'sans-serif')
      .selectAll('g')
      .data(chords.groups)
      .join('g');

    group.append('path')
      .attr('fill', (d) => color(names[d.index]))
      .attr('d', arc);

    group.append('text')
      .each((d) => (d.angle = (d.startAngle + d.endAngle) / 2))
      .attr('dy', '0.35em')
      .attr('transform', (d) => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 5})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .attr('text-anchor', (d) => (d.angle > Math.PI ? 'end' : null))
      .text((d) => names[d.index]);

    group.append('title')
      .text((d) => `${names[d.index]}
${d3.sum(chords, (c) => (c.source.index === d.index) * c.source.value)} outgoing ???
${d3.sum(chords, (c) => (c.target.index === d.index) * c.source.value)} incoming ???`);

    svg.append('g')
      .attr('fill-opacity', 0.75)
      .selectAll('path')
      .data(chords)
      .join('path')
      .style('mix-blend-mode', 'multiply')
      .attr('fill', (d) => color(names[d.source.index]))
      .attr('d', ribbon)
      .append('title')
      .text((d) => `${names[d.source.index]} ??? ${names[d.target.index]} ${d.source.value}`);
  }, [])

  return <svg ref={svgRef} style={{ height: '960px', width: '100%' }} />
}

export default PlayerPerDeviceSVG
