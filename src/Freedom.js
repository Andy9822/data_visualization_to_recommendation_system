/* eslint-disable func-names */
/* eslint-disable react/no-this-in-sfc */
import React, { useState } from 'react'
import * as d3 from 'd3'
import axios from 'axios'

const buildPlayerPerDeviceSVG = (breadcrumbRef, sunburtRef, data) => {
  // Dimensions of sunburst.
  const width = 750;
  const height = 600;
  const radius = Math.min(width, height) / 2;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
  const b = {
    w: 75, h: 30, s: 3, t: 10,
  };

  // Mapping of step names to colors.
  const colors = {
    home: '#5687d1',
    product: '#7b615c',
    search: '#de783b',
    account: '#6ab975',
    other: '#a173d1',
    end: '#bbbbbb',
  };

  // Total size of all segments; we set this later, after loading the data.
  let totalSize = 0;

  const vis = d3.select('#chart').append('svg:svg')
    .attr('width', width)
    .attr('height', height)
    .append('svg:g')
    .attr('id', 'container')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

  const arc = d3.arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1));

  // Use d3.text and d3.csvParseRows so that we do not need to have a header
  // row, and can receive the csv as an array of arrays.
  createVisualization(data)

  // Main function to draw and set up the visualization, once we have the data.
  function createVisualization(json) {
    // Basic setup of page elements.
    initializeBreadcrumbTrail();
    drawLegend();
    d3.select('#togglelegend').on('click', toggleLegend);

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append('svg:circle')
      .attr('r', radius)
      .style('opacity', 0);

    // Turn the data into a d3 hierarchy and calculate the sums.
    const root = d3.hierarchy(json)
      .sum((d) => d.size)
      .sort((a, b) => b.value - a.value);

    // For efficiency, filter nodes to keep only those large enough to see.
    const nodes = partition(root).descendants()
      .filter((d) => (d.x1 - d.x0 > 0.005), // 0.005 radians = 0.29 degrees
      );

    const path = vis.data([json]).selectAll('path')
      .data(nodes)
      .enter()
      .append('svg:path')
      .attr('display', (d) => (d.depth ? null : 'none'))
      .attr('d', arc)
      .attr('fill-rule', 'evenodd')
      .style('fill', (d) => colors[d.data.name])
      .style('opacity', 1)
      .on('mouseover', mouseover);

    // Add the mouseleave handler to the bounding circle.
    d3.select('#container').on('mouseleave', mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.datum().value;
  }

  // Fade all but the current sequence, and show it in the breadcrumb trail.
  function mouseover(d) {
    const percentage = (100 * d.value / totalSize).toPrecision(3);
    let percentageString = `${percentage}%`;
    if (percentage < 0.1) {
      percentageString = '< 0.1%';
    }

    d3.select('#percentage')
      .text(percentageString);

    d3.select('#explanation')
      .style('visibility', '');

    const sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    updateBreadcrumbs(sequenceArray, percentageString);

    // Fade all the segments.
    d3.selectAll('path')
      .style('opacity', 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll('path')
      .filter((node) => (sequenceArray.indexOf(node) >= 0))
      .style('opacity', 1);
  }

  // Restore everything to full opacity when moving off the visualization.
  function mouseleave(d) {
    // Hide the breadcrumb trail
    d3.select('#trail')
      .style('visibility', 'hidden');

    // Deactivate all segments during transition.
    d3.selectAll('path').on('mouseover', null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll('path')
      .transition()
      .duration(1000)
      .style('opacity', 1)
      .on('end', function () {
        d3.select(this).on('mouseover', mouseover);
      });

    d3.select('#explanation')
      .style('visibility', 'hidden');
  }

  function initializeBreadcrumbTrail() {
  // Add the svg area.
    const trail = d3.select('#sequence').append('svg:svg')
      .attr('width', width)
      .attr('height', 50)
      .attr('id', 'trail');
    // Add the label at the end, for the percentage.
    trail.append('svg:text')
      .attr('id', 'endlabel')
      .style('fill', '#000');
  }

  // Generate a string that describes the points of a breadcrumb polygon.
  function breadcrumbPoints(d, i) {
    const points = [];
    points.push('0,0');
    points.push(`${b.w},0`);
    points.push(`${b.w + b.t},${b.h / 2}`);
    points.push(`${b.w},${b.h}`);
    points.push(`0,${b.h}`);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(`${b.t},${b.h / 2}`);
    }
    return points.join(' ');
  }

  // Update the breadcrumb trail to show the current sequence and percentage.
  function updateBreadcrumbs(nodeArray, percentageString) {
    // Data join; key function combines name and depth (= position in sequence).
    const trail = d3.select('#trail')
      .selectAll('g')
      .data(nodeArray, (d) => d.data.name + d.depth);

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    const entering = trail.enter().append('svg:g');

    entering.append('svg:polygon')
      .attr('points', breadcrumbPoints)
      .style('fill', (d) => colors[d.data.name]);

    entering.append('svg:text')
      .attr('x', (b.w + b.t) / 2)
      .attr('y', b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => d.data.name);

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr('transform', (d, i) => `translate(${i * (b.w + b.s)}, 0)`);

    // Now move and update the percentage at the end.
    d3.select('#trail').select('#endlabel')
      .attr('x', (nodeArray.length + 0.5) * (b.w + b.s))
      .attr('y', b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select('#trail')
      .style('visibility', '');
  }

  function drawLegend() {
    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    const li = {
      w: 75, h: 30, s: 3, r: 3,
    };

    const legend = d3.select('#legend').append('svg:svg')
      .attr('width', li.w)
      .attr('height', Object.keys(colors).length * (li.h + li.s));

    const g = legend.selectAll('g')
      .data(Object.entries(colors))
      .enter().append('svg:g')
      .attr('transform', (d, i) => `translate(0,${i * (li.h + li.s)})`);

    g.append('svg:rect')
      .attr('rx', li.r)
      .attr('ry', li.r)
      .attr('width', li.w)
      .attr('height', li.h)
      .style('fill', (d) => d.value);

    g.append('svg:text')
      .attr('x', li.w / 2)
      .attr('y', li.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => d.key);
  }

  function toggleLegend() {
    const legend = d3.select('#legend');
    if (legend.style('visibility') == 'hidden') {
      legend.style('visibility', '');
    } else {
      legend.style('visibility', 'hidden');
    }
  }
}

const PlayerPerDeviceSVG = (props) => {
  const breadcrumbRef = React.useRef(null)
  const sunburtRef = React.useRef(null)
  const svgWidth = 960
  const svgHeight = 960

  React.useEffect(async () => {
    const { data } = props
    window.axios = axios
    const response = await (await axios.get('http://wsl:3030')).data
    buildPlayerPerDeviceSVG(breadcrumbRef, sunburtRef, response)
  }, [props.data])// eslint-disable-line react/destructuring-assignment

  return (
    <>
      <div id="main">
        <div id="sequence" />
        <div id="chart">
          <div id="explanation">
            <span id="percentage" />
            <br />
            of visits begin with this sequence of pages
          </div>
        </div>
      </div>
    </>
  )
}

export default PlayerPerDeviceSVG
