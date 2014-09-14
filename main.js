// set up SVG for D3
var width  = 960,
    height = 500,
    colors = d3.scale.category10();

var svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

var nodes = [
    {id: 0},
    {id: 1},
    {id: 2}
  ];
var lastNodeId = 2;
var links = [
    {source: nodes[0], target: nodes[1]},
    {source: nodes[1], target: nodes[2]}
  ];

// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(150)
    .charge(-300)
    .on('tick', tick)

// handles to link and node element groups
var line = svg.append('svg:g').selectAll('line'),
    circle = svg.append('svg:g').selectAll('g');

// mouse event vars
var selected_node = null,
    just_created_link = false;

function tick() {
  line.attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// update graph (called when needed)
function restart() {
  // line (link) group
  line = line.data(links);

  // add new links
  line.enter().append('svg:line')
    .attr('class', 'link');

  // remove old links
  line.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .classed('selected_node', function(d) { return d === selected_node; });

  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 12)
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    // .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
    .on('mouseover', function(d) {
      if(!selected_node || d === selected_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function(d) {
      if(!selected_node || d === selected_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', function(d) {

      if (selected_node === null) {
        selected_node = d;
      }
      else if (d === selected_node) {
        selected_node = null;
      }
      else {
        links.push({source: selected_node, target: d});  // also ad removing
        selected_node = null;
        just_created_link = true;
        restart();
      }
      d3.select(this).classed('selected_node', function(d) { return d === selected_node; });

    });

  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.id; });

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

function mousedown() {

  // prevent I-bar on drag
  //d3.event.preventDefault();
  
  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.ctrlKey || selected_node || just_created_link) {
    just_created_link = false;
    return;
  }

  // insert new node at point
  var point = d3.mouse(this),
      node = {id: ++lastNodeId};
  node.x = point[0];
  node.y = point[1];
  nodes.push(node);

  restart();
}

// app starts here
svg.on('mousedown', mousedown);

restart();