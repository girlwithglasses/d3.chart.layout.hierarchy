/*!
 * d3.chart.layout.hierarchy - v0.3.9
 * https://github.com/bansaghi/d3.chart.layout.hierarchy/
 * 
 * Copyright (c) 2015 Anna Bansaghi <anna.bansaghi@mamikon.net> (http://mamikon.net), forked by Amelia Ireland <aireland@lbl.gov>
 * Library released under BSD-3-Clause license.
 */

(function(global, factory) {

  "use strict";

  if( typeof global.define === "function" && global.define.amd ) {
    define(["d3"], function(d3) {
      factory(global, d3);
    });
  } else {
    factory(global, global.d3);
  }

})(this, function(window, d3) {

"use strict";


d3.chart("hierarchy", {

  initialize: function( options ) {
    var chart = this;

    options = options || {};

    // set up defaults
    chart.d3 = {
        colorScale: options.colors
          ? d3.scale.ordinal().range(options.colors)
          : d3.scale.category20c()

        , zoom: d3.behavior.zoom()
    };

    chart.layers = {
        base: chart.base.append('g')
    };

    var dimensions = {
      width: chart.base.node().parentNode.clientWidth,
      height: chart.base.node().parentNode.clientHeight
    };

    chart.base.node().style.width = '100%';
    chart.base.node().style.height ='100%';

    chart.options = {
        // get the chart dimensions from the container
        width: options.width       || chart.base.node().parentNode.clientWidth
      , height: options.height     || chart.base.node().parentNode.clientHeight

      , name: options.name         || "name"
//    , value: options.value       || "value"
      , duration: options.duration || 750

    };

//     ['zoomable'].map(function(f){
//       if (options.hasOwnProperty(f) ) {
//         chart[ f ]( options[ f ] );
//       }
//     });

    chart._internalUpdate = false;

    chart.off("change:value").on("change:value", function() {
      if (! chart.d3 || ! chart.d3.layout ) {
        console.log('Layout not set yet, cannot use value');
        return;
      }
      chart.d3.layout.value(function(d) {
        return chart.options.value === "_COUNT_" ? 1 : d[chart.options.value];
      });
    });


    chart.off("change:colors").on("change:colors", function() {
      chart.d3.colorScale = d3.scale.ordinal().range(chart.options.colors);
    });

  },



  transform: function(nodes) {
    var chart = this;

    if( ! chart._internalUpdate ) {
      chart._walker(
        chart.root,
        function(d) { d.isLeaf = ! d.children && ! d._children; },
        function(d) {
          if( d.children && d.children.length > 0 ) {
            return d.children;
          } else if( d._children && d._children.length > 0 ) {
            return d._children;
          } else {
            return null;
          }
        }
      );
    }

    return nodes;
  },


  name: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.name; }

    chart.options.name = _;

    chart.trigger("change:name");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },


  value: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.value; }

    chart.options.value = _;

    chart.trigger("change:value");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },


  colors: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.colors; }

    chart.options.colors = _;

    chart.trigger("change:colors");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },


  duration: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.duration; }

    chart.options.duration = _;

    chart.trigger("change:duration");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },


  sortable: function(_) {
    var chart = this;

    if( _ === "_ASC_" ) {
      chart.d3.layout.sort(function(a, b) {
        return d3.ascending(a[chart.options.name], b[chart.options.name] );
      });
    } else if( _ === "_DESC_" ) {
      chart.d3.layout.sort(function(a, b) {
        return d3.descending(a[chart.options.name], b[chart.options.name] );
      });
    } else {
      chart.d3.layout.sort(_);
    }

    return chart;
  },


  zoomable: function(_) {
    var chart = this;

    var extent = _ || [0, Infinity];

    function zoom() {
      chart.layers.base
        .attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }

    chart.base.call(chart.d3.zoom.scaleExtent(extent).on("zoom", zoom));

    return chart;
  },


  /* added */
  data : function() {
    return this.root;
  },

  with_tips : function(_){
    var chart = this;
    chart.tip = _;
    return chart;
  },

/**
  cfg : function(_) {
    var chart = this
    , p
    ;
    if( ! arguments.length ) { return chart.options; }

    for (p in _) {
      chart.options[p] = _[p];
      chart.trigger('change:' + p );
    }

    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },
*/
/* end addition */

  // http://bl.ocks.org/robschmuecker/7926762
  _walker: function(parent, walkerFunction, childrenFunction) {
    if( ! parent ) { return; }

    walkerFunction(parent);

    var children = childrenFunction(parent);
    if( children ) {
      for( var count = children.length, i = 0; i < count; i++ ) {
        this._walker( children[i], walkerFunction, childrenFunction );
      }
    }
  },


});




d3.chart("hierarchy").extend("cluster-tree", {

  initialize : function() {
    var chart = this;

    var counter = 0;

    chart.radius(chart.options.radius     || 4.5);
    chart.levelGap(chart.options.levelGap || "auto");


    chart.layers.links = chart.layers.base.append("g").classed("links", true);
    chart.layers.nodes = chart.layers.base.append("g").classed("nodes", true);


    chart.layer("nodes", chart.layers.nodes, {

      dataBind: function(nodes) {
        return this.selectAll(".node").data(nodes, function(d) {
          return d._id || (d._id = ++counter);
        });
      },

      insert: function() {
        return this.append("g").classed("node", true);
      },

      events: {
        'update': function(){
          this.classed( 'expandable', function(d){ return d._children; });
        },

        'enter': function() {
          this.classed( 'leaf', function(d) { return d.isLeaf; });
          this.classed( 'expandable', function(d){ return d._children; });

          this.append("circle")
            .attr("r", 0);

          this.append("text")
            .attr("dy", ".35rem")
            .text(function(d) { return d[chart.options.name]; })
            .style("fill-opacity", 0);


          this.on("click", function(event) { chart.trigger("click:node", event); });
        },

        'merge': function() {
          // Set additional node classes as they may change during manipulations
          // with data. For example, a node is added to another leaf node, so
          // ex-leaf node should change its class from node-leaf to node-parent.
          this.classed( "leaf", function(d) { return d.isLeaf; });
          this.classed( 'expandable', function(d){ return d._children; });
        },

        'merge:transition': function() {
          this.select("circle")
            .attr("r", chart.options.radius);

          this.select("text")
            .style("fill-opacity", 1);
        },

        "exit:transition": function() {
          this.duration(chart.options.duration)
            .remove();

          this.select("circle")
            .attr("r", 0);

          this.select("text")
            .style("fill-opacity", 0);
        },
      }
    });


    chart.layer("links", chart.layers.links, {

      dataBind: function(nodes) {
        return this.selectAll(".link")
          .data(chart.d3.layout.links(nodes), function(d) {
            return d.target._id;
          });
      },

      insert: function() {
        return this.append("path").classed("link", true);
      },

      events: {
        "enter": function() {
          this
            .attr("d", function(d) {
              var o = { x: chart.source.x0, y: chart.source.y0 };
              return chart.d3.diagonal({ source: o, target: o });
            });
        },

        "merge:transition": function() {
          this.duration(chart.options.duration)
            .attr("d", chart.d3.diagonal);
        },

        "exit:transition": function() {
          this.duration(chart.options.duration)
            .attr("d", function(d) {
              var o = { x: chart.source.x, y: chart.source.y };
              return chart.d3.diagonal({ source: o, target: o });
            })
            .remove();
        },
      },
    });

  },

  transform: function(nodes) {
    var chart = this;

    if( ! chart._internalUpdate ) { chart.trigger("init:collapsible", nodes); }

    nodes = chart.d3.layout.nodes(chart.root);

    // Adjust gap between node levels.
    if( chart.options.levelGap && chart.options.levelGap !== "auto" ) {
      nodes.forEach(function(d) { d.y = d.depth * chart.options.levelGap; });
    }

    chart.off("transform:stash").on("transform:stash", function() {
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    });

    return nodes;
  },



  radius: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.radius; }

    if( _ === "_COUNT_" ) {
      chart.options.radius = function(d) {
        if( d._children ) {
          return d._children.length;
        } else if( d.children ) {
          return d.children.length;
        }
        return 1;
      };

    } else {
      chart.options.radius = _;
    }

    chart.trigger("change:radius");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },


  /** Y axis scaling
   * Sets a gap between node levels. Accepts either number of pixels or string
   * "auto". When level gap set to "auto", gap between node levels will be
   * maximized, so the tree takes full width.
   *
   * @author: Basil Gren @basgren
   *
   * @param _
   * @returns {*}
   */
  levelGap: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.levelGap; }

    chart.options.levelGap = _;
    chart.trigger("change:levelGap");

    if( chart.root ) { chart.draw(chart.root); }
    return chart;
  },


  collapsible: function(_) {
    var chart = this;

    var depth = _;

    chart.off("init:collapsible").on("init:collapsible", function( nodes ) {
      if( depth !== undefined ) {
        nodes.forEach(function(d) {
          if( d.depth == depth ) {
            collapse(d);
          }
        });
      }
    });



    chart.off("click:node").on("click:node", function(d) {
      d = toggle(d);
      chart.trigger("transform:stash");

      // Set _internalUpdate, so chart will know that certain actions shouldn't
      // be performed during update.
      // @see cluster-tree.cartesian.transform
      // @see cluster-tree.radial.transform
      chart._internalUpdate = true;
      chart.draw(d);
      chart._internalUpdate = false;

    });


    function toggle(d) {
      if( d.children ) {
        d._children = d.children;
        d.children = null;
      } else if( d._children ) {
        d.children = d._children;
        d._children = null;
      }
      return d;
    }


    function collapse(d) {
      if( d.children ) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    return chart;
  },
});




d3.chart("cluster-tree").extend("cluster-tree.cartesian", {

  initialize : function() {
    var chart = this;

    chart.margin(chart.options.margin || {});

    chart.d3.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

    chart.layers.nodes.on("enter", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y0 + "," + chart.source.x0 + ")"; });

      this.select("text")
        .attr("x", function(d) { return d.isLeaf ? 10 : -10; })
        .attr("text-anchor", function(d) { return d.isLeaf ? "start" : "end"; });
    });

    chart.layers.nodes.on("merge:transition", function() {
      this.duration(chart.options.duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
    });

    chart.layers.nodes.on("exit:transition", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y + "," + chart.source.x + ")"; });
    });


    chart.off("change:margin").on("change:margin", function() {
     chart.options.width  = chart.base.node().parentNode.clientWidth  - chart.options.margin.left - chart.options.margin.right;
     chart.options.height = chart.base.node().parentNode.clientHeight - chart.options.margin.top  - chart.options.margin.bottom;
      chart.layers.base.attr("transform", "translate(" + chart.options.margin.left + "," + chart.options.margin.top + ")");
    });

  },



  transform: function(root) {
    var chart = this;

    var nodes;

    chart.source = root;

    if( ! chart._internalUpdate ) {
      chart.root    = root;
      chart.root.x0 = chart.options.height / 2;
      chart.root.y0 = 0;
    }

    return chart.d3.layout
      .size([chart.options.height, chart.options.width])
      .nodes(chart.root);
  },


  margin: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.margin; }

    ["top", "right", "bottom", "left"].forEach(function(dimension) {
      if( dimension in _ ) {
        this[dimension] = _[dimension];
      }
    }, chart.options.margin = { top: 0, right: 0, bottom: 0, left: 0 });

    chart.trigger("change:margin");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },
});




d3.chart("cluster-tree").extend("cluster-tree.radial", {

  initialize : function() {
    var chart = this;

    chart.diameter(chart.options.diameter || Math.min(chart.options.width, chart.options.height));

    chart.d3.diagonal = d3.svg.diagonal.radial().projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
    chart.d3.zoom.translate([chart.options.diameter / 2, chart.options.diameter / 2]);

    chart.layers.base
      .attr("transform", "translate(" + chart.options.diameter / 2 + "," + chart.options.diameter / 2 + ")");


    chart.layers.nodes.on("enter", function() {
      this
        .attr("transform", function(d) { return "rotate(" + (chart.source.x0 - 90) + ")translate(" + chart.source.y0 + ")"; });

      this.select("text")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform",   function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; });
    });

    chart.layers.nodes.on("merge:transition", function() {
      this.duration(chart.options.duration)
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });
    });

    chart.layers.nodes.on("exit:transition", function() {
      this
        .attr("transform", function(d) { return "rotate(" + (chart.source.x - 90) + ")translate(" + chart.source.y + ")"; });
    });
  },


  transform: function(root) {
    var chart = this;

    chart.source = root;

    if( ! chart._internalUpdate ) {
      chart.root    = root;
      chart.root.x0 = 360;
      chart.root.y0 = 0;
    }

    return chart.d3.layout
      .size([360, chart.options.diameter / 4])
      .separation(function(a, b) {
        if( a.depth === 0 ) {
          return 1;
        } else {
          return (a.parent == b.parent ? 1 : 2) / a.depth;
        }
      })
      .nodes(chart.root);
  },


  diameter: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.diameter; }

    chart.options.diameter = _;
    
    chart.trigger("change:diameter");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },
});




d3.chart("cluster-tree.cartesian").extend("cluster.cartesian", {
  initialize : function() {
    this.d3.layout = d3.layout.cluster();
  },
});


d3.chart("cluster-tree.radial").extend("cluster.radial", {
  initialize : function() {
    this.d3.layout = d3.layout.cluster();
  },
});


d3.chart("cluster-tree.cartesian").extend("tree.cartesian", {
  initialize : function() {
    this.d3.layout = d3.layout.tree();
  },
});


d3.chart("cluster-tree.radial").extend("tree.radial", {
  initialize : function() {
    this.d3.layout = d3.layout.tree();
  }
});


d3.chart("hierarchy").extend("pack.flattened", {

  initialize : function() {
    var chart = this;

    chart.d3.layout = d3.layout.pack();
   
    chart.bubble(chart.options.bubble     || {});
    chart.diameter(chart.options.diameter || Math.min(chart.options.width, chart.options.height));

    chart.d3.zoom.translate([(chart.options.width - chart.options.diameter) / 2, (chart.options.height - chart.options.diameter) / 2]);

    chart.layers.base
      .attr("transform", "translate(" + (chart.options.width - chart.options.diameter) / 2 + "," + (chart.options.height - chart.options.diameter) / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(nodes) {
        return this.selectAll(".pack").data(nodes.filter(function(d) { return ! d.children; }));
      },

      insert: function() {
        return this.append("g").classed("pack", true);
      },

      events: {
        "enter": function() {

          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          this.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return chart.d3.colorScale(chart.options.bubble.pack(d)); });

          this.append("text")
            .attr("dy", ".3em")
            .text(function(d) { return d[chart.options.name].substring(0, d.r / 3); });

          this.append("title")
            .text(chart.options.bubble.title);

          this.on("click", function(event) {
            chart.trigger("pack:click", event);
          });
        },
      }
    });

    chart.off("change:diameter").on("change:diameter", function() {
      chart.layers.base
        .attr("transform", "translate(" + (chart.options.width - chart.options.diameter) / 2 + "," + (chart.options.height - chart.options.diameter) / 2 + ")");
    });
  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout
      .size([chart.options.diameter, chart.options.diameter])
      .padding(1.5)
      .nodes(chart.options.bubble.flatten ? chart.options.bubble.flatten(root) : root);
  },


  diameter: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.diameter; }

    chart.options.diameter = _ - 10;

    chart.trigger("change:diameter");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },


  bubble: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.bubble; }

    ["flatten", "title", "pack"].forEach(function(func) {
      if( func in _ ) {
        this[func] = d3.functor(_[func]);
      }
    }, chart.options.bubble = {
       flatten : null,
       title   : function(d) { return d[chart.options.value]; },
       pack    : function(d) { return d[chart.options.name]; }
      }
    );

    chart.trigger("change:formats");

    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },

});




d3.chart("hierarchy").extend("pack.nested", {

  initialize : function() {
    var chart = this;
    
    chart.d3.layout = d3.layout.pack();

    chart.diameter(chart.options.diameter || Math.min(chart.options.width, chart.options.height));

    chart.d3.zoom.translate([(chart.options.width - chart.options.diameter) / 2, (chart.options.height - chart.options.diameter) / 2]);

    chart.layers.base
      .attr("transform", "translate(" + (chart.options.width - chart.options.diameter) / 2 + "," + (chart.options.height - chart.options.diameter) / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(nodes) {
        return this.selectAll(".pack").data(nodes);
      },

      insert: function() {
        return this.append("g").classed("pack", true);
      },

      events: {
        "enter": function() {
          this.classed( "leaf", function(d) { return d.isLeaf; });

          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          this.append("circle").attr("r", function(d) { return d.r; });
          this.append("text");

          this.on("click", function(event) { chart.trigger("click:pack", event); });
        },

        "merge": function() {
          this.select("text")
            .style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
            .text(function(d) { return d[chart.options.name]; });
        },
      }
    });


    chart.off("change:diameter").on("change:diameter", function() {
      chart.layers.base
        .attr("transform", "translate(" + (chart.options.width - chart.options.diameter) / 2 + "," + (chart.options.height - chart.options.diameter) / 2 + ")");
    });
  },


  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout
      .size([chart.options.diameter, chart.options.diameter])
      .nodes(root);
  },


  diameter: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.diameter; }

    chart.options.diameter = _ - 10;

    chart.trigger("change:diameter");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  }, 


  collapsible: function() {
    var chart = this;

    var pack,
        x = d3.scale.linear().range([0, chart.options.diameter]),
        y = d3.scale.linear().range([0, chart.options.diameter]);


    chart.layers.base.on("merge", function() {
      pack = chart.root;
      chart.off("click:pack").on("click:pack", function(d) { collapse(pack == d ? chart.root : d); });
    });


    function collapse(d) {
      var k = chart.options.diameter / d.r / 2;

      x.domain([d.x - d.r, d.x + d.r]);
      y.domain([d.y - d.r, d.y + d.r]);

      var t = chart.layers.base.transition().duration(chart.options.duration);

      t.selectAll(".pack")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      t.selectAll("circle")
        .attr("r", function(d) { return k * d.r; });

      t.selectAll("text")
        .style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

      pack = d;
    }

    return chart;
  },
});




d3.chart("hierarchy").extend("partition.arc", {
 
  initialize : function() {
    var chart = this;

    chart.d3.layout = d3.layout.partition();

    chart.diameter(chart.options.diameter || Math.min(chart.options.width, chart.options.height));

    chart.d3.x   = d3.scale.linear().range([0, 2 * Math.PI]);
    chart.d3.y   = d3.scale.sqrt().range([0, chart.options.diameter / 2]);
    chart.d3.arc = d3.svg.arc()
      .startAngle(function(d)  { return Math.max(0, Math.min(2 * Math.PI, chart.d3.x(d.x))); })
      .endAngle(function(d)    { return Math.max(0, Math.min(2 * Math.PI, chart.d3.x(d.x + d.dx))); })
      .innerRadius(function(d) { return Math.max(0, chart.d3.y(d.y)); })
      .outerRadius(function(d) { return Math.max(0, chart.d3.y(d.y + d.dy)); });

    chart.d3.zoom.translate([chart.options.width / 2, chart.options.height / 2]);

    chart.layers.base
      .attr("transform", "translate(" + chart.options.width / 2 + "," + chart.options.height / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(nodes) {
        return this.selectAll("path").data(nodes);
      },

      insert: function() {
        return this.append("path");
      },

      events: {
        "enter": function() {
          this.classed( "leaf", function(d) { return d.isLeaf; });

          this.attr("d", chart.d3.arc)
            .style("fill", function(d) { return chart.d3.colorScale((d.children ? d : d.parent)[chart.options.name]); });

          this.on("click", function(event) { chart.trigger("click:path", event); });
        }
      }
    });


    chart.off("change:radius").on("change:radius", function() {
      chart.layers.paths
        .attr("transform", "translate(" + chart.options.width / 2 + "," + chart.options.height / 2 + ")");

      chart.d3.y = d3.scale.sqrt().range([0, chart.options.diameter / 2]);
    });

  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout.nodes(root);
  },


  diameter: function(_) {
    var chart = this;

    if( ! arguments.length ) { return chart.options.diameter; }

    chart.options.diameter = _ - 10;

    chart.trigger("change:radius");
    if( chart.root ) { chart.draw(chart.root); }

    return chart;
  },


  collapsible: function() {
    var chart = this;

    chart.layers.base.on("merge", function() {
      var path = this;
      chart.off("click:path").on("click:path", function(d) {
          path.transition()
            .duration(chart.options.duration)
            .attrTween("d", arcTween(d));
        });
    });

    function arcTween(d) {
      var xd = d3.interpolate(chart.d3.x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(chart.d3.y.domain(), [d.y, 1]),
          yr = d3.interpolate(chart.d3.y.range(),  [d.y ? 20 : 0, chart.options.diameter / 2]);

      return function(d, i) {
        return i ? function(t) { return chart.d3.arc(d); }
                 : function(t) { chart.d3.x.domain(xd(t)); chart.d3.y.domain(yd(t)).range(yr(t)); return chart.d3.arc(d); };
      };
    }

    return chart;
  },
});



d3.chart("hierarchy").extend("partition.rectangle", {

  initialize : function() {

    var chart = this;

    chart.d3.layout = d3.layout.partition();

    chart.d3.x_scale = d3.scale.linear().range([0, chart.options.width]);
    chart.d3.y_scale = d3.scale.linear().range([0, chart.options.height]);

    chart.d3.transform = function(d, ky) { return "translate(8," + d.dx * ky / 2 + ")"; };
    chart.layers.base.classed('Blues', true);

    chart.layer("base", chart.layers.base, {

      dataBind: function(nodes) {
        return this.selectAll(".partition").data(nodes);
      },

      insert: function() {
        return this.append("g").classed("partition", true);
      },

      events: {
        "enter": function() {

          this.attr("transform", function(d) { return "translate(" + chart.d3.x_scale(d.y) + "," + chart.d3.y_scale(d.x) + ")"; });

          this.attr('class', function(d){ return 'partition q' + d.depth + '-9'; })
          .classed("leaf", function(d) { return d.isLeaf; });


          var kx = chart.options.width  / chart.root.dx,
              ky = chart.options.height / 1;

          this.append("rect")
            .attr("width", chart.root.dy * kx)
            .attr("height", function(d) { return d.dx * ky; });

          this.append("text")
            .attr("transform", function(d) { return chart.d3.transform(d, ky); })
            .attr("dy", ".35em")
            .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
            .text(function(d) { return d[chart.options.name]; });

          this.on("click", function(event) { chart.trigger("click:rect", event); });
        }
      }
    });
  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout.nodes(root);
  },


  collapsible: function() {
    var chart = this;

    var node
      , details = d3.selectAll('.js_sample_details')
      ;

    chart.layers.base.on('enter', function(){
//      d3.select( '#' + chart.root.path ).classed('js_hide', true);
      details.classed('js_hide', true);
    });
    chart.layers.base.on("merge", function() {
      node = chart.root;
      chart.off("click:rect").on("click:rect", function(d) {

        details.classed('js_hide', true);
        if ( d.isLeaf ) {
          d3.select('#taxon_oid_' + d.data.taxon_oid)
            .classed('js_hide', false);
        }
//         d3.select( (node.isLeaf
//         ? '#taxon_oid_' + node.data.taxon_oid
//         : '#' + node.path ) ).classed('js_show', false);
//
//         d3.select( (d.isLeaf
//         ? '#taxon_oid_' + d.data.taxon_oid
//         : '#' + d.path ) ).classed('js_show', true);

        node = (
          d.isLeaf
          ? this.leaf_handler(d)
          : this.collapse(node == d ? chart.root : d)
        );
      });
    });

    return chart;
  },

  leaf_handler: function(d) {
    return this.collapse(d);
  },

  collapse: function(d) {
      var chart = this
        , offset = 20
        , kx = (d.y ? chart.options.width - offset : chart.options.width) / (1 - d.y)
        , ky = chart.options.height / d.dx
      /* START INSERT: add extra space on the top and bottom to allow easier access to vertically-adjacent partitions */
        , t_off = 0
        , b_off = 0
        , new_ky
        ;
        if ( 1 !== d.dx ) {
          // top of the vis
          if ( ! d.x ) {
            b_off = offset;
          }
          else {
            var total = d.x + d.dx;
            // bottom of the vis
            if ( 1 == total.toFixed(3) ) {
                t_off = offset;
            }
            else {
                // between two rects
                b_off = offset;
                t_off = offset;
            }
          }
        }

        // update the scales
        // y axis total range
        new_ky = ( chart.options.height - b_off - t_off ) / d.dx;

        if ( new_ky < chart.options.height ) {
          new_ky = chart.options.height;
          b_off = 0;
          t_off = 0;
        }

        /* END INSERT */
      chart.d3.x_scale.domain([d.y, 1]).range([d.y ? offset : 0, chart.options.width]);

      offset = offset / new_ky;
      chart.d3.y_scale.domain([ d.x - ( t_off ? offset : 0 ), d.x + d.dx + ( b_off ? offset : 0 ) ]);

      var t = chart.layers.base.transition()
        .duration(chart.options.duration);

      t.selectAll(".partition")
        .attr("transform", function(d) { return "translate(" + chart.d3.x_scale(d.y) + "," + chart.d3.y_scale(d.x) + ")"; });

      t.selectAll("rect")
        .attr("width", d.dy * kx)
        .attr("height", function(d) { return d.dx * ky; });

      t.selectAll("text")
        .attr("transform", function(d) { return chart.d3.transform(d, ky); })
        .style("opacity",  function(d) { return d.dx * ky > 12 ? 1 : 0; });

      return d;
    }


});




d3.chart("hierarchy").extend("treemap", {
 
  initialize : function() {
    var chart = this;

    chart.d3.layout = d3.layout.treemap();

    chart.layer("base", chart.layers.base, {

      dataBind: function(nodes) {
        return this.selectAll(".cell").data(nodes);
      },

      insert: function() {
        return this.append("g").classed("cell", true);
      },

      events: {
        "enter": function() {
          this.classed( "leaf", function(d) { return d.isLeaf; });

          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          
          this.append("rect")
            .attr("width", function(d) { return d.dx; })
            .attr("height", function(d) { return d.dy; })
            .attr("fill", function(d) { return d.parent ? chart.d3.colorScale(d.parent[chart.options.name]) : null; });

          this.append("text")
            .attr("x", function(d) { return d.dx / 2; })
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .text(function(d) { return d.children ? null : d[chart.options.name]; }) // order is matter! getComputedTextLength
            .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

          this.on("click", function(event) { chart.trigger("click:rect", event); });
        },
      }
    });
  },


  transform: function(root) {
    var chart  = this;

    chart.root = root;

    return chart.d3.layout
      .round(false)
      .size([chart.options.width, chart.options.height])
      .sticky(true)
      .nodes(root);
  },


  collapsible: function() {
    var chart = this;

    var node,
        x = d3.scale.linear().range([0, chart.options.width]),
        y = d3.scale.linear().range([0, chart.options.height]);

    chart.layers.base.on("merge", function() {
      node = chart.root;
      chart.off("click:rect").on("click:rect", function(d) { collapse(node == d.parent ? chart.root : d.parent); });
    });

    function collapse(d) {
      var kx = chart.options.width  / d.dx,
          ky = chart.options.height / d.dy;

      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      var t = chart.layers.base.transition()
        .duration(chart.options.duration);

      t.selectAll(".cell")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      t.selectAll("rect")
        .attr("width",  function(d) { return kx * d.dx; })
        .attr("height", function(d) { return ky * d.dy; });

      t.selectAll("text")
        .attr("x", function(d) { return kx * d.dx / 2; })
        .attr("y", function(d) { return ky * d.dy / 2; })
        .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

      node = d;
    }

    return chart;
  },
});



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





});

