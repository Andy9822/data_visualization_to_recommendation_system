/* eslint-disable func-names */
/* eslint-disable react/no-this-in-sfc */
import React from 'react'
import * as d3 from 'd3'

const getMostParentNode = (node) => {
  let currentNode = node
  while (currentNode.parent) {
    currentNode = currentNode.parent
  }
  return currentNode
}

const PlayerPerDeviceSVG = ({ data }) => {
  const svgRef = React.useRef(null)
  const svgWidth = 960
  const svgHeight = 960

  React.useEffect(() => {
    const color = d3.scaleLinear()
      .domain([0, 5])
      .range(['hsl(152,80%,80%)', 'hsl(228,30%,40%)'])
      .interpolate(d3.interpolateHcl)

    const width = 932
    const height = 932

    const pack = (data) => d3.pack()
      .size([width, height])
      .padding(3)(d3.hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value))

    const svgEl = d3.select(svgRef.current)
    svgEl.selectAll('*').remove()
    const root = pack(data)
    let focus = root
    let view
    let label
    let svg
    let node

    function zoomTo(v) {
      const k = width / v[2]

      view = v

      label.attr('transform', (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`)
      node.attr('transform', (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`)
      node.attr('r', (d) => d.r * k)
    }

    function zoom(event, d) {
      focus = d

      console.log(svgEl);
      const transition = svgEl.transition()
        .duration(event.altKey ? 7500 : 750)
        .tween('zoom', () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2])
          return (t) => zoomTo(i(t))
        })

      label
        .filter(function (d) { return d.parent === focus || this.style.display === 'inline' })
        .transition(transition)
        .style('fill-opacity', (d) => (d.parent === focus ? 1 : 0))
        .on('start', function (d) { if (d.parent === focus) this.style.display = 'inline' })
        .on('end', function (d) { if (d.parent !== focus) this.style.display = 'none' })
    }

    svg = svgEl.attr('viewBox', `-${width / 2} -${height / 2} ${width} ${height}`)
      .style('display', 'block')
      .style('margin', '0 0px')
      .style('background', color(0))
      .style('cursor', 'pointer')
      .on('click', (event) => zoom(event, root))

    node = svg.append('g')
      .selectAll('circle')
      .data(root.descendants().slice(1))
      .join('circle')
      .attr('fill', (d) => (d.children ? color(d.depth) : 'white'))
      .attr('pointer-events', (d) => (!d.children ? 'none' : null))
      .on('mouseover', function () { d3.select(this).attr('stroke', '#000') })
      .on('mouseout', function () { d3.select(this).attr('stroke', null) })
      .on('click', (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()))

    label = svg.append('g')
      .style('font', '10px sans-serif')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(root.descendants())
      .join('text')
      .style('fill-opacity', (d) => (d.parent === root ? 1 : 0))
      .style('display', (d) => (d.parent === root ? 'inline' : 'none'))
      .text((d) => {
        const value = d.data.value || getMostParentNode(d).value
        return `${d.data.name} (${value})`
      })

    zoomTo([root.x, root.y, root.r * 2])
  }, [data])

  return <svg ref={svgRef} style={{ height: '960px', width: '100%' }} />
}

export default PlayerPerDeviceSVG
