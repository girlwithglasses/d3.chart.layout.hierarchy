/* adapted from kueda's d3.phylogram.js */

d3.svg.diagonal.rightAngle = function(){

  var diagonal = function (d, i) {

    var pathFn = this.path_lib[ this.path_type ]
      , pathData = pathFn(d);
    pathData = pathData.map(d3.svg.diagonal.projection);
    return this.path(pathData)
  }
  , path_lib = {
      vert_horiz: function(p){
        return [ p.source,{ x: p.target.x, y: p.source.y}, p.target ];
      },

      horiz_vert: function(p){
        return [ p.source,{ x: p.source.x, y: p.target.y}, p.target ];
      },

      dogleg: function(p){
        return [ p.source,
        {   x: p.source.x,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: p.target.x,
            y: (p.source.y + p.target.y) / 2
        }, p.target];
      },

      vertical_dogleg: function(p){
        return [ p.source,
        {   x: (p.source.x + p.target.x) / 2,
            y: p.source.y
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: p.target.y
        }, p.target];
      },
  }
  , path = function( pathData) {
    return 'M' + pathData.join(' ');
  }
  , path_type = function(_) {
      if (! arguments.length) return this.path_type || 'dogleg';
      this.path_type = _;
      return this.diagonal;
  }
};

d3.phylogram = {
    // helper function for getting types
    _get_type: function(elem) {
      return Object.prototype.toString.call(elem).slice(8, -1);
    },


    path: {
      vert_horiz: function(p){
        return [ p.source,{ x: p.target.x, y: p.source.y}, p.target ];
      },

      horiz_vert: function(p){
        return [ p.source,{ x: p.source.x, y: p.target.y}, p.target ];
      },

      dogleg: function(p){
        return [ p.source,
        {   x: p.source.x,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: p.target.x,
            y: (p.source.y + p.target.y) / 2
        }, p.target];
      },

      vertical_dogleg: function(p){
        return [ p.source,
        {   x: (p.source.x + p.target.x) / 2,
            y: p.source.y
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: p.target.y
        }, p.target];
      },

      radial: function(p) {
        return [ p.source,{ x: p.target.x, y: p.source.y }, p.target ];
      }

    }
    ,
    rightAngleDiagonal: function() {
      var projection = function(d) { return [d.y, d.x]; }

      , path = function(pathData) {
        return "M" + pathData.join(' ');
      }
      , valid_path_types = function() {
        return Object.keys( d3.phylogram.path );
      }
      , path_type = 'dogleg'
      ;

      function diagonal(d, i) {
        var pathData = d3.phylogram.path[ path_type ](d);
        pathData = pathData.map(projection);
        console.log('path data now: ' + pathData);
        return path(pathData)
      }

      diagonal.path_type = function(x) {
        if (! arguments.length) return path_type;
        if ( d3.phylogram.path[ x ] ) {
          path_type = x;
          return diagonal;
        }
        throw new Error( x + ' is not a valid path type' );
      };

      diagonal.projection = function(x) {
        if (!arguments.length) return projection;
        projection = x;
        return diagonal;
      };

      diagonal.path = function(x) {
        if (!arguments.length) return path;
        path = x;
        return diagonal;
      };

      return diagonal;
    }
    ,
    radialRightAngleDiagonal: function() {

      return d3.phylogram.rightAngleDiagonal()
        .path_type( 'radial' )
        .projection(function(d) {
          var r = d.y, a = (d.x - 90) / 180 * Math.PI;
          return [r * Math.cos(a), r * Math.sin(a)];
        })
        .path( function(pathData) {
          var src = pathData[0],
              mid = pathData[1],
              dst = pathData[2],
              radius = Math.sqrt(src[0]*src[0] + src[1]*src[1]),
              srcAngle = d3.phylogram.coordinateToAngle(src, radius),
              midAngle = d3.phylogram.coordinateToAngle(mid, radius),
              clockwise = Math.abs(midAngle - srcAngle) > Math.PI ? midAngle <= srcAngle : midAngle > srcAngle,
              rotation = 0,
              largeArc = 0,
              sweep = clockwise ? 0 : 1;

          return 'M' + [ src
            , 'A' + [radius,radius]
            , rotation
            , largeArc + ',' + sweep
            , mid + 'L' + dst ].join(' ');
        })
    }
    ,
  // Convert XY and radius to angle of a circle centered at 0,0
    coordinateToAngle: function(coord, radius) {
      var wholeAngle = 2 * Math.PI
      , quarterAngle = wholeAngle / 4
      , coordQuad = coord[0] >= 0 ? (coord[1] >= 0 ? 1 : 2) : (coord[1] >= 0 ? 4 : 3)
      , coordBaseAngle = Math.abs(Math.asin(coord[1] / radius))
      , coordAngle
      ;

      // Since this is just based on the angle of the right triangle formed
      // by the coordinate and the origin, each quad will have different
      // offsets
      switch (coordQuad) {
        case 1:
          coordAngle = quarterAngle - coordBaseAngle
          break
        case 2:
          coordAngle = quarterAngle + coordBaseAngle
          break
        case 3:
          coordAngle = 2*quarterAngle + quarterAngle - coordBaseAngle
          break
        case 4:
          coordAngle = 3*quarterAngle + coordBaseAngle
      }
      return coordAngle;
    }
//     maxLength: function( d ){
//       return d.length + (d.children ? d3.max(d.children, maxLength) : 0);
//     }
//     ,
//
//     calcYscale: function( root, chart ){
//       var yScale = d3.scale.linear()
//         .domain([0, d3.phylogram.maxLength( root )])
//         .range ([0, chart.options.width ]);
//
//       setYscale( root, 0, yScale );
//
//       return yScale;
//     }
//     ,
//
//     setYscale: function( d, offset, yScale ){
//       d.y = (offset += d.length) * yScale;
//       if (d.children) d.children.forEach(function(d) { setRadius(d, offset, yScale); });
//     }

};

/**

var outerRadius = 960 / 2,
    innerRadius = outerRadius - 170;

  setRadius(root, root.length = 0, innerRadius / maxLength(root));


// Compute the maximum cumulative length of any node in the tree.
function maxLength(d) {
  return d.length + (d.children ? d3.max(d.children, maxLength) : 0);
}

// Set the radius of each node by recursively summing and scaling the distance from the root.
function setRadius(d, y0, k) {
  d.radius = (y0 += d.length) * k;
  if (d.children) d.children.forEach(function(d) { setRadius(d, y0, k); });
}


  function scaleBranchLengths(nodes, w) {
    // Visit all nodes and adjust y pos width distance metric
    var visitPreOrder = function(root, callback) {
      callback(root)
      if (root.children) {
        for (var i = root.children.length - 1; i >= 0; i--){
          visitPreOrder(root.children[i], callback)
        };
      }
    }
    , rootDists
    , yScale;
    visitPreOrder(nodes[0], function(node) {
      node.rootDist = (node.parent ? node.parent.rootDist : 0) + (node.length || 0)
    });
    rootDists = nodes.map(function(n) { return n.rootDist; });
    yScale = d3.scale.linear()
      .domain([0, d3.max(rootDists)])
      .range([0, w]);
    visitPreOrder(nodes[0], function(node) {
      node.y = yScale(node.rootDist)
    });
    return yScale;
  };

    if (options.skipBranchLengthScaling) {
      var yScale = d3.scale.linear()
        .domain([0, w])
        .range([0, w]);
    } else {
      var yScale = scaleBranchLengths(nodes, w)
    }

*/

d3.chart('cluster-tree.cartesian').extend('cluster-tree.cartesian.diagonal', {
  diagonal: function(_) {
    var chart = this;
    if( ! arguments.length ) { return chart.options.diagonal; }

    chart.d3.diagonal = d3.phylogram.rightAngleDiagonal();

    if( _ === "rightAngle" ) {
      _ = 'dogleg';
    }
    // set the path type. Will throw an error if invalid.
    // we should really propagate the error and die nicely...
    chart.d3.diagonal.path_type( _ );

    chart.trigger("change:diagonal");

    if( chart.root ){ chart.draw(chart.root); }

    return chart;
  },
  initialize: function(){
		console.log('running initialize');
    var chart = this;
    chart.d3.diagonal = chart.options.diagonal || d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
  }
});

d3.chart("cluster-tree.cartesian.diagonal").extend("cluster.cartesian.diagonal", {
  initialize : function() {
		console.log('running initialize');
    this.d3.layout = d3.layout.cluster();
  }
});

d3.chart('cluster-tree.cartesian.diagonal').extend('tree.cartesian.diagonal',{
  initialize: function() {
		console.log('running initialize');
    this.d3.layout = d3.layout.cluster()
        .size([this.options.height, this.options.width])
        .separation( function(a,b) {return 1} )
        .sort(function(node) {
          return node.children ? node.children.length : -1;
        })
        ;
  }
});

d3.chart('cluster-tree.radial').extend('cluster-tree.radial.diagonal', {
  diagonal: function(_) {
    var chart = this;
    if( ! arguments.length ) { return chart.options.diagonal; }

    if( _ === "rightAngle" || _ === "rightAngleRadial") {
      chart.d3.diagonal = d3.phylogram.radialRightAngleDiagonal();
      chart.duration( 0 );
    } else {
      console.log('Invalid argument for diagonal');
    }

    chart.trigger("change:diagonal");

    if( chart.root ){ chart.draw(chart.root); }

    return chart;
  },
  initialize: function() {
		console.log('running initialize');
    var chart = this;
    chart.d3.diagonal = chart.options.diagonal || d3.svg.diagonal.radial().projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
  }
});


d3.chart("cluster-tree.radial.diagonal").extend("cluster.radial.diagonal", {
  initialize : function() {
		console.log('running initialize');
    this.d3.layout = d3.layout.cluster();
  }
});


d3.chart('cluster-tree.radial.diagonal').extend('tree.radial.diagonal',{
  initialize: function() {
		console.log('running initialize');
    this.d3.layout = d3.layout.cluster()
        .size([this.options.height, this.options.width])
        .separation( function(a,b) {return 1} )
        .sort(function(node) {
          return node.children ? node.children.length : -1;
        })
        ;
  }
});



