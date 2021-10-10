/* eslint-disable func-names */
/* eslint-disable react/no-this-in-sfc */
import React, { useState } from 'react'
import * as d3 from 'd3'
import axios from 'axios'

const buildPlayerPerDeviceSVG = (breadcrumbRef, sunburtRef, data) => {
  const breadcrumbWidth = 75
  const breadcrumbHeight = 30
  const width = 640
  const radius = width / 2
  const color = d3
    .scaleOrdinal()
    .domain(['home', 'product', 'search', 'account', 'other', 'end'])
    .range(['#5d85cf', '#7c6561', '#da7847', '#6fb971', '#9e70cf', '#bbbbbb'])

  function breadcrumbPoints(d, i) {
    const tipWidth = 10;
    const points = [];
    points.push('0,0');
    points.push(`${breadcrumbWidth},0`);
    points.push(`${breadcrumbWidth + tipWidth},${breadcrumbHeight / 2}`);
    points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
    points.push(`0,${breadcrumbHeight}`);
    if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
      points.push(`${tipWidth},${breadcrumbHeight / 2}`);
    }
    return points.join(' ');
  }

  const mousearc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius(radius)

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(1 / radius)
    .padRadius(radius)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1) - 1)

  const partition = (data) => d3.partition().size([2 * Math.PI, radius * radius])(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value),
  )

  const root = partition(data);
  const svg = d3.select(sunburtRef.current)
  svg.selectAll('*').remove()
  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  const element = svg.node();
  element.value = { sequence: [], percentage: 0.0 };

  const label = svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', '#888')
    .style('visibility', 'hidden');

  label
    .append('tspan')
    .attr('class', 'percentage')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', '-0.1em')
    .attr('font-size', '3em')
    .text('');

  label
    .append('tspan')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', '1.5em')
    .text('of visits begin with this sequence');

  svg
    .attr('viewBox', `${-radius} ${-radius} ${width} ${width}`)
    .style('max-width', `${width}px`)
    .style('font', '12px sans-serif');

  const path = svg
    .append('g')
    .selectAll('path')
    .data(
      root.descendants().filter((d) =>
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        d.depth && d.x1 - d.x0 > 0.001),
    )
    .join('path')
    .attr('fill', (d) => color(d.data.name))
    .attr('d', arc);

  svg
    .append('g')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseleave', () => {
      path.attr('fill-opacity', 1);
      label.style('visibility', 'hidden');
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0 };
      element.dispatchEvent(new CustomEvent('input'));
    })
    .selectAll('path')
    .data(
      root.descendants().filter((d) =>
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        d.depth && d.x1 - d.x0 > 0.001),
    )
    .join('path')
    .attr('d', mousearc)
    .on('mouseenter', (event, d) => {
      // Get the ancestors of the current segment, minus the root
      const sequence = d
        .ancestors()
        .reverse()
        .slice(1);
      // Highlight the ancestors
      path.attr('fill-opacity', (node) => (sequence.indexOf(node) >= 0 ? 1.0 : 0.3));
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label
        .style('visibility', null)
        .select('.percentage')
        .text(`${percentage}%`);
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage };
      element.dispatchEvent(new CustomEvent('input'));
    })

  const sunburst = element

  // const breadcrumbSVG = d3.select(breadcrumbRef.current)
  // svg.selectAll('*').remove()
  const breadcrumbSVG = d3.create('svg')
    .attr('viewBox', `0 0 ${breadcrumbWidth * 10} ${breadcrumbHeight}`)
    .style('font', '12px sans-serif')
    .style('margin', '5px');

  console.log(sunburtRef.current);
  console.log(breadcrumbSVG);
  console.log(sunburst.sequence);

  // const g = breadcrumbSVG
  //   .selectAll('g')
  //   .data(sunburst.sequence)
  //   .join('g')
  //   .attr('transform', (d, i) => `translate(${i * breadcrumbWidth}, 0)`);

  // g.append('polygon')
  //   .attr('points', breadcrumbPoints)
  //   .attr('fill', (d) => color(d.data.name))
  //   .attr('stroke', 'white');

  // g.append('text')
  //   .attr('x', (breadcrumbWidth + 10) / 2)
  //   .attr('y', 15)
  //   .attr('dy', '0.35em')
  //   .attr('text-anchor', 'middle')
  //   .attr('fill', 'white')
  //   .text((d) => d.data.name);

  // breadcrumbSVG
  //   .append('text')
  //   .text(sunburst.percentage > 0 ? `${sunburst.percentage}%` : '')
  //   .attr('x', (sunburst.sequence.length + 0.5) * breadcrumbWidth)
  //   .attr('y', breadcrumbHeight / 2)
  //   .attr('dy', '0.35em')
  //   .attr('text-anchor', 'middle');
}

const PlayerPerDeviceSVG = (props) => {
  const breadcrumbRef = React.useRef(null)
  const sunburtRef = React.useRef(null)
  const svgWidth = 960
  const svgHeight = 960

  const [response, setResponse] = useState(null)

  React.useEffect(async () => {
    const { data } = props
    window.axios = axios
    const response = await (await axios.get('http://wsl:3030')).data
    setResponse(response)
    // console.log(data)
    // console.log(response)
  }, [props.data])// eslint-disable-line react/destructuring-assignment

  if (!response) {
    return null
  }
  buildPlayerPerDeviceSVG(breadcrumbRef, sunburtRef, response)

  return (
    <>
      <svg ref={breadcrumbRef} style={{ height: '960px', width: '100%' }} />
      <svg ref={sunburtRef} style={{ height: '960px', width: '100%' }} />
    </>
  )
}

export default PlayerPerDeviceSVG
