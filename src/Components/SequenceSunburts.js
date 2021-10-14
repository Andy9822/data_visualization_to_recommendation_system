/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
import React, { useEffect } from 'react'
import * as d3 from 'old-d3'

const stringToColour = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    colour += (`00${value.toString(16)}`).substr(-2);
  }
  return colour;
}

const SequenceSunburts = ({ data }) => {
  useEffect(async () => {
    // Dimensions of sunburst.
    const width = 900;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    const x = d3.scaleLinear()
      .range([0, 2 * Math.PI]);

    const y = d3.scaleLinear()
      .range([0, radius]);

    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
    const b = {
      w: 150, h: 30, s: 3, t: 10,
    };

    // Total size of all segments; we set this later, after loading the data.
    let totalSize = 0;

    const vis = d3.select('#chart').append('svg:svg')
      .attr('width', width)
      .attr('height', height)
      .append('svg:g')
      .attr('id', 'container')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const partition = d3.partition();

    const arc = d3.arc()
      .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
      .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
      .innerRadius((d) => Math.max(0, y(d.y0)))
      .outerRadius((d) => Math.max(0, y(d.y1)));

    // Use d3.text and d3.csv.parseRows so that we do not need to have a header
    // row, and can receive the csv as an array of arrays.
    /*    d3.text("visit-sequences.csv", function(text) {
      var csv = d3.csv.parseRows(text);
      var json = buildHierarchy(csv);
      createVisualization(json);
    }); */
    createVisualization(data, data);

    // Main function to draw and set up the visualization, once we have the data.
    function createVisualization(json) {
      // Basic setup of page elements.
      initializeBreadcrumbTrail()

      // Bounding circle underneath the sunburst, to make it easier to detect
      // when the mouse leaves the parent g.
      vis.append('svg:circle')
        .attr('r', radius)
        .style('opacity', 0);

      // For efficiency, filter nodes to keep only those large enough to see.

      const root = d3.hierarchy(json);
      //   console.log(root);
      root.sum((d) => d.value);

      const nodes = partition(root).descendants()
      // filtering filters out over half of nodes
      /*          .filter(function(d) {
          var dx = d.x1 - d.x0;
          return (dx > 0.005); // 0.005 radians = 0.29 degrees
          }); */

      // Determines max depth when entering data to paths
      let maxDepth = 0;
      const path = vis.data(nodes).selectAll('path')
        .data(nodes)
        .enter()
        .append('svg:path')
        .attr('display', (d) => (d.depth ? null : 'none'))
        .attr('d', arc)
        .attr('fill-rule', 'evenodd')
        .style('fill', (d) => {
          if (d.depth > maxDepth) {
            maxDepth = d.depth;
          }
          return stringToColour((d.children ? d : d.parent).data.name)
        })
        .style('opacity', 1)
        .on('mouseover', mouseover);

      // Bounding inner circle based on depth of elements
      const innerG = vis.append('g');

      const innerBound = innerG.append('circle')
        .attr('r', radius / (maxDepth + 1))
        .attr('id', 'innerBound')
        .style('opacity', 0);

      const innerText = innerG.append('text')
        .attr('id', 'percentage')
        .attr('x', -45)
        .attr('y', 10)
        .text('');

      // Add the mouseleave handler to the bounding circle.
      d3.select('#container').on('mouseleave', mouseleave);

      // Get total size of the tree = value of root node from partition.
      totalSize = path.node().__data__.value;

    //   console.log('totalSize:', totalSize);
    }

    // Fade all but the current sequence, and show it in the breadcrumb trail.
    function mouseover(d) {
    //   console.log('d:', d)
      const percentage = (100 * d.value / totalSize).toPrecision(3);
      let percentageString = `${percentage}%`;
      if (percentage < 0.1) {
        percentageString = '< 0.1%';
      }

      d3.select('#percentage')
        .text(percentageString);

      d3.select('#explanation')
        .style('visibility', '');

      const sequenceArray = getAncestors(d);
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
        .duration(600)
        .style('opacity', 1)
        .on('end', function () {
          d3.select(this).on('mouseover', mouseover);
          d3.select('#percentage').text('');
        });

      d3.select('#explanation')
        .style('visibility', 'hidden');
    }

    // Given a node in a partition layout, return an array of all of its ancestor
    // nodes, highest first, but excluding the root.
    function getAncestors(node) {
      const path = [];
      let current = node;
      while (current.parent) {
        path.unshift(current);
        current = current.parent;
      }
      return path;
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
      console.log(nodeArray[nodeArray.length - 1])
      const lastElement = nodeArray[nodeArray.length - 1]
      const isChild = Boolean(lastElement.parent.parent)
      console.log(isChild);
      console.log('_');

      const message = (isChild
        ? `${(lastElement.value / lastElement.parent.value).toPrecision(1) * 100}% dos usuários que viram ${lastElement.data.name.split('(')[0]} também viram ${lastElement.parent.data.name}`
        : `${(lastElement.value / lastElement.parent.value).toPrecision(1) * 100}% de todos os usuários assistiram ${lastElement.data.name}`
      )

      // Data join; key function combines name and depth (= position in sequence).
      const g = d3.select('#trail')
        .selectAll('g')
        .data(nodeArray, (d) => d.data.name + d.depth);

      // Add breadcrumb and label for entering nodes.
      const entering = g.enter().append('g');

      entering.append('svg:polygon')
        .attr('points', breadcrumbPoints)
        .style('fill', (d) => stringToColour((d.children ? d : d.parent).data.name));

      entering.append('svg:text')
        .attr('x', (b.w + b.t) / 4)
        .attr('y', b.h / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text((d) => d.data.name.split('(')[0]);

      // Set position for entering and updating nodes.
      d3.select('#trail')
        .selectAll('g').attr('transform', (d, i) => `translate(${(d.depth - 1) * (b.w + b.s)}, 0)`);

      // Remove exiting nodes.
      g.exit().remove();

      const trailX = (nodeArray.length + 1.7) * (b.w + b.s)
      // Now move and update the percentage at the end.
      d3.select('#trail').select('#endlabel')
        .attr('x', trailX)
        .attr('y', b.h / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text(message);

      // Make the breadcrumb trail visible, if it's hidden.
      d3.select('#trail')
        .style('visibility', '');
    }
  }, [data])

  return (
    <div>
      <div id="main">
        <div id="sequence" />
        <div id="chart">
          <div id="explanation" style={{ visibility: 'hidden' }}>
            <span id="percentage" />
            <br />
            dos usuários viram ambos gêneros
          </div>
        </div>
      </div>

    </div>
  )
}

export default SequenceSunburts
