function onClickLoad(e){
  var input = document.getElementById('input-field');
getGraph(input.value);
}

function getGraph(url) {
  d3.json(url, function(data) {
    var svg = document.getElementById('svg');
    if(svg) {
      svg.remove();
    }
    drawGraph(data.graph);
  });
}

function drawGraph(data) {
  var isDirected = true;
  var nodeColor = 'CornflowerBlue';
  var nodeRadius = 15;
  var linkColor = 'black';
  var highlightLinkColor = 'YellowGreen';
  var currentPos = [0,0];
  var currentScale = 1;
  var spread = 40;
  var linkLength = 10;
  var size = {
        height: window.innerHeight - 130,
        width: window.innerWidth*.77
      };
  var force, paths, circles;
  var svg = d3.select('.svg-wrapper')
              .append('svg')
              .attr('id', 'svg')
              .attr('height', size.height)
              .attr('width', size.width)
              .attr('pointer-events', 'all');
  var container = svg.append('svg:g')
                    .call(d3.behavior.zoom().on('zoom', redraw))
                    .append('g');
  var dragRect = container.append('svg:rect')
                   .attr('width', "100%")
                   .attr('height', size.height)
                   .attr('fill', 'white');
  var lineGroup = container.append('g');
  var circleGroup = container.append('g');

  data.forEach( function(node) {
    node.color = node.color || nodeColor;
    node.radius = node.radius || nodeRadius;
    node.edges = node.edges.map( function(edge) {
      for(var i = 0; i < data.length; i++) {
        if(data[i].id === edge.id) {
          return data[i];
        }
      }
    });
  });



  force = d3.layout.force()
            .size([size.width, size.height])
            .linkDistance(function(d) { return Math.max(d.source.radius, d.target.radius) * linkLength;})
            .charge(function(d) {return -d.radius * spread; });

  force.on('tick', function(e) {
    d3.selectAll('div.loading')
      .style('visibility', 'hidden');

    paths
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; })

    circles
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });
  });

  update();

  function redraw() {
    currentPos = d3.event.translate;
    currentScale = d3.event.scale;

    container.attr("transform",
        "translate(" + currentPos + ")"
        + " scale(" + currentScale + ")");
  }

  function update() {
    var links = [];

    data.forEach(function(source) {
      for(var j = 0; source.edges && j < source.edges.length; j++) {
        var target = source.edges[j];
        links.push({source: source, target: target});
      }
    });

    force.nodes(data)
      .links(links)
      .start();

    paths = lineGroup
              .attr('class', 'links')
              .selectAll('line')
                .data(links, function(d) { return d.source.id + d.target.id; } );

    paths
      .enter()
      .append('line')
        .style('stroke', linkColor)
        .attr('marker-end', function(d) { return 'url(#'+ nodeClass(d.source) + "_" + nodeClass(d.target) +')' })
        .attr('class', function(d) { return nodeClass(d.source) + " " + nodeClass(d.target);})

    paths
      .exit()
      .remove();

    if (isDirected) {
      markers = lineGroup
                  .selectAll('defs')
                  .data(links, function(d) { return d.source.id + d.target.id; } );

      markers
        .enter()
        .append('defs')
          .append('marker')
            .attr('id', function(d) { return nodeClass(d.source) + "_" + nodeClass(d.target);})
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', function(d) { return +d.target.radius + 8 })
            .attr('refY', 3)
            .attr('orient', 'auto')
            .attr('markerUnits', 'strokeWidth')
            .append('path')
              .attr('d', "M0,0 L0,6 L9,3 z")
              .attr('fill', linkColor);

      markers
        .exit()
        .remove()
    }

    circles = circleGroup
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(data, function(d) { return d.id; });

    circles
      .enter()
      .append('circle')
        .attr('fill', function(d) {return d.color})
        .attr('class', function(d) { return nodeClass(d); })
        .attr('title', function(d) { return d.name; })
        .attr('r', function(d) { return d.radius; })
        .on('mouseover', highlightLinkedNodes)
        .on('mouseout', dehighlightLinkedNodes)
        .call(force.drag);

    circles
      .exit()
      .remove();
  }

  function nodeClass(f) {
    return 'u' + f.id;
  }

  function highlightLinkedNodes(d) {
    highlightNode(d);

    d3.selectAll('line.' + nodeClass(d))
      .transition()
      .style('stroke', highlightLinkColor)
      .attr('stroke-width', 1.1)

    d3.selectAll('[id*="'+nodeClass(d)+'"] path')
      .attr('fill', highlightLinkColor)

    if(d.edges) {
      d.edges.forEach(node => {
        highlightNode(node);
      });
    }
  }

  function highlightNode(d) {
    d3.selectAll('circle.' + nodeClass(d))
      .transition()
      .attr('r', function(d) { return d.radius * 1.1; });

    if(d.name) {
      d.tooltip = d3.select('.svg-wrapper')
        .append('div')
        .attr('class', 'tooltip')
        .text(d.name + ' (' + d.edges.length + ')')
        .style('top', (d.y * currentScale + currentPos[1])-185 + 'px')
        .style('left', (d.x * currentScale +currentPos[0]) + 'px');
    }
  }

  function dehighlightLinkedNodes(d) {
    dehighlightNode(d);

    d3.selectAll('line.' + nodeClass(d))
      .transition()
      .style('stroke', linkColor)
      .attr('stroke-width', 1);

    d3.selectAll('[id*="'+nodeClass(d)+'"] path')
      .attr('fill', linkColor);

    if(d.edges) {
      d.edges.forEach( node => {
        dehighlightNode(node);
      });
    }
  }

  function dehighlightNode(d) {
    d3.selectAll("circle." + nodeClass(d))
      .attr('fill', function(d) {return d.color})
      .transition()
      .attr('r', function(d) { return d.radius; });

    if(d.tooltip) {
      d.tooltip.remove();
    }
  }
}
