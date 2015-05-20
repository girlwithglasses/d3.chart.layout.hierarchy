/*!
 * d3.chart.layout.hierarchy - v0.3.4
 * https://github.com/bansaghi/d3.chart.layout.hierarchy/
 * 
 * Copyright (c) 2015 Anna Bansaghi <anna.bansaghi@mamikon.net> (http://mamikon.net)
 * Library released under BSD-3-Clause license.
 */


(function(d3) {
  "use strict";


d3.chart("hierarchy", {

  initialize: function() {
    var chart = this;

    chart.d3     = {};
    chart.layers = {};


    chart.base.attr("width",  chart.base.node().parentElement.clientWidth);
    chart.base.attr("height", chart.base.node().parentElement.clientHeight);

    chart.d3.colorScale = chart._colors ? d3.scale.ordinal().range(chart._colors) : d3.scale.category20c();

    chart.d3.zoom = d3.behavior.zoom();
    chart.layers.base = chart.base.append("g");
    
    chart.name(chart._name         || "name");
    chart.value(chart._value       || "value");
    chart.duration(chart._duration || 750);



    chart.on("change:value", function() {
      chart.d3.layout.value(function(d) { return chart._value === "_COUNT" ? 1 : d[chart._value]; });
    });


    chart.on("change:colors", function() {
      chart.d3.colorScale = d3.scale.ordinal().range(chart._colors);
    });


    // http://bl.ocks.org/robschmuecker/7926762
    chart._walker = function(parent, walkerFunction, childrenFunction) {
      if( ! parent ) {
        return;
      }

      walkerFunction(parent);

      var children = childrenFunction(parent);
      if( children ) {
        for( var count = children.length, i = 0; i < count; i++ ) {
          chart._walker( children[i], walkerFunction, childrenFunction );
        }
      }
    };


    /**
     * Initializes node attributes.
     *
     * @param node SVG element that represents node.
     * @private
     */
    chart._initNode= function(node) {
      node
        .classed("leaf", function(d) { return d.isLeaf; })
        .classed("non-leaf", function(d) { return ! d.isLeaf; });
    };
  },



  transform: function(nodes) {
    // Before we proceed, mark leaf nodes on tree
    this._walker(

      this.root,
      
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

    return nodes;
  },


  name: function(_) {
    if( ! arguments.length ) {
      return this._name;
    }

    this._name = _;

    this.trigger("change:name");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },


  value: function(_) {
    if( ! arguments.length ) {
      return this._value;
    }

    this._value = _;

    this.trigger("change:value");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },


  colors: function(_) {
    if( ! arguments.length ) {
      return this._colors;
    }

    this._colors = _;

    this.trigger("change:colors");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;    
  },


  duration: function(_) {
    if( ! arguments.length ) {
      return this._duration;
    }

    this._duration = _;

    this.trigger("change:duration");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
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


  sort: function(_) {
    var chart = this;

    if( _ === "_ASC" ) {
      chart.d3.layout.sort(function(a, b) { return d3.ascending(a[chart._name], b[chart._name] ); });
    } else if( _ === "_DESC" ) {
      chart.d3.layout.sort(function(a, b) { return d3.descending(a[chart._name], b[chart._name] ); });
    } else {
      chart.d3.layout.sort(_);
    }

    return chart;
  },
});




d3.chart("hierarchy").extend("cluster-tree", {

  initialize : function() {

    var chart = this;

    var counter = 0;

    chart.radius(chart._radius || 4.5);
    chart.levelGap(chart._levelGap || "auto");

    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

    chart.layers.links = chart.layers.base.append("g").classed("links", true);
    chart.layers.nodes = chart.layers.base.append("g").classed("nodes", true);


    chart.layer("nodes", chart.layers.nodes, {

      dataBind: function(data) {
        return this.selectAll(".node").data(data, function(d) { return d._id || (d._id = ++counter); });
      },

      insert: function() {
        return this.append("g").classed("node", true);
      },

      events: {
        "enter": function() {

          chart._initNode(this);

          this.append("circle")
            .attr("r", 0);

          this.append("text")
            .attr("dy", ".35em")
            .text(function(d) { return d[chart._name]; })
            .style("fill-opacity", 0);

          this.on("click", function(event) {
            chart.trigger("node:click", event);
          });
        },

        "merge": function() {
          chart._initNode(this);
        },

        "merge:transition": function() {
          this.select("circle")
            .attr()
            .attr("r", chart._radius);

          this.select("text")
            .style("fill-opacity", 1);
        },

        "exit:transition": function() {
          this.duration(chart._duration)
            .remove();

          this.select("circle")
            .attr("r", 0);

          this.select("text")
            .style("fill-opacity", 0);
        },
      }
    });


    chart.layer("links", chart.layers.links, {
      dataBind: function(data) {
        return this.selectAll(".link")
          .data(chart.d3.layout.links(data), function(d) { return d.target._id; });
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
          this.duration(chart._duration)
            .attr("d", chart.d3.diagonal);
        },

        "exit:transition": function() {
          this.duration(chart._duration)
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

    // Adjust gap between node levels.
    if( chart._levelGap && chart._levelGap !== "auto" ) {
      nodes.forEach(function (d) { d.y = d.depth * chart._levelGap; });
    }
    
    return nodes;
  },



  radius: function(_) {
    if( ! arguments.length ) {
      return this._radius;
    }

    if( _ === "_COUNT" ) {
      this._radius = function(d) {
        if( d._children ) {
          return d._children.length;
        } else if( d.children ) {
          return d.children.length;
        }
        return 1;
      };

    } else {
      this._radius = _;
    }

    this.trigger("change:radius");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },


  /**
   * Sets a gap between node levels. Acceps eithe number of pixels or string
   * "auto". When level gap set to "auto", gap between node levels will be
   * maximized, so the tree takes full width.
   * 
   * @author: Basil Gren @basgren
   *
   * @param _
   * @returns {*}
   */
  levelGap: function(_) {
    if( ! arguments.length ) {
      return this._levelGap;
    }

    this._levelGap = _;
    this.trigger("change:levelGap");

    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },


  collapsible: function(_) {
    var chart = this;

    var depth = _;

    chart.once("collapse:init", function() {

      if( depth !== undefined ) {

        chart._walker(

          chart.root,

          function(d) { if( d.depth == depth ) { collapse(d); }},

          function(d) {
            if( d.children && d.children.length > 0 && d.depth < depth ) {
              return d.children;
            } else if( d._children && d._children.length > 0 && d.depth < depth ) {
              return d._children;
            } else {
              return null;
            }
          }
        );
      }
    });



    chart.on("node:click", function(d) {
      d = toggle(d);
      chart.trigger("transform:stash");
      chart.draw(d);
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

    chart.margin(chart._margin || {});

    chart.d3.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });


    chart.layers.nodes.on("enter", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y0 + "," + chart.source.x0 + ")"; });

      this.select("text")
        .attr("x", function(d) { return d.isLeaf ? 10 : -10; })
        .attr("text-anchor", function(d) { return d.isLeaf ? "start" : "end"; });
    });

    chart.layers.nodes.on("merge:transition", function() {
      this.duration(chart._duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
    });

    chart.layers.nodes.on("exit:transition", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y + "," + chart.source.x + ")"; });
    });


    chart.on("change:margin", function() {
      chart._width  = chart.base.attr("width")  - chart._margin.left - chart._margin.right;
      chart._height = chart.base.attr("height") - chart._margin.top  - chart._margin.bottom;
      chart.base.attr("transform", "translate(" + chart._margin.left + "," + chart._margin.top + ")");
    });
  },



  transform: function(root) {
    var chart = this,
        nodes;

    chart.source = root;

    if( ! chart.root ) {
      chart.root    = root;
      chart.root.x0 = chart._height / 2;
      chart.root.y0 = 0;

      nodes = chart.d3.layout
        .size([chart._height, chart._width])
        .nodes(chart.root); // workaround for getting correct chart.root to transform method in hierarchy.js

      chart.trigger("collapse:init");
    }

    nodes = chart.d3.layout.nodes(chart.root).reverse();

    chart.on("transform:stash", function() {
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    });

    return nodes;
  },


  margin: function(_) {
    if( ! arguments.length ) {
      return this._margin;
    }

    ["top", "right", "bottom", "left"].forEach(function(dimension) {
      if( dimension in _ ) {
        this[dimension] = _[dimension];
      }
    }, this._margin = { top: 0, right: 0, bottom: 0, left: 0 });

    this.trigger("change:margin");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },
});




d3.chart("cluster-tree").extend("cluster-tree.radial", {

  initialize : function() {

    var chart = this;

    chart.diameter(chart._diameter || Math.min(chart._width, chart._height));

    chart.d3.diagonal = d3.svg.diagonal.radial().projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
    chart.d3.zoom.translate([chart._diameter / 2, chart._diameter / 2]);

    chart.layers.base
      .attr("transform", "translate(" + chart._diameter / 2 + "," + chart._diameter / 2 + ")");


    chart.layers.nodes.on("enter", function() {
      this
        .attr("transform", function(d) { return "rotate(" + (chart.source.x0 - 90) + ")translate(" + chart.source.y0 + ")"; });

      this.select("text")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform",   function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; });
    });

    chart.layers.nodes.on("merge:transition", function() {
      this.duration(chart._duration)
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });
    });

    chart.layers.nodes.on("exit:transition", function() {
      this
        .attr("transform", function(d) { return "rotate(" + (chart.source.x - 90) + ")translate(" + chart.source.y + ")"; });
    });
  },


  transform: function(root) {
    var chart = this,
        nodes;
    chart.source = root;

    if( ! chart.root ) {
      chart.root    = root;
      chart.root.x0 = 360;
      chart.root.y0 = 0;

      nodes = chart.d3.layout
        .size([360, chart._diameter / 4])
        .separation(function(a, b) {
            if( a.depth === 0 ) {
               return 1;
            } else {
              return (a.parent == b.parent ? 1 : 2) / a.depth;
            }
        }) // workaround
        .nodes(chart.root);

      chart.trigger("collapse:init");
    }

    nodes = chart.d3.layout.nodes(chart.root).reverse();

    chart.on("transform:stash", function() {
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    });

    return nodes;
  },


  diameter: function(_) {
    if( ! arguments.length ) {
      return this._diameter;
    }

    this._diameter = _;
    
    this.trigger("change:diameter");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
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
   
    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

    chart.bubble(chart._bubble     || {});
    chart.diameter(chart._diameter || Math.min(chart._width, chart._height));

    chart.d3.zoom.translate([(chart._width - chart._diameter) / 2, (chart._height - chart._diameter) / 2]);

    chart.layers.base
      .attr("transform", "translate(" + (chart._width - chart._diameter) / 2 + "," + (chart._height - chart._diameter) / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(data) {
        return this.selectAll(".pack").data(data.filter(function(d) { return ! d.children; }));
      },

      insert: function() {
        return this.append("g").classed("pack", true);
      },

      events: {
        "enter": function() {

          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          this.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return chart.d3.colorScale(chart._bubble.pack(d)); });

          this.append("text")
            .attr("dy", ".3em")
            .text(function(d) { return d[chart._name].substring(0, d.r / 3); });

          this.append("title")
            .text(chart._bubble.title);

          this.on("click", function(event) {
            chart.trigger("pack:click", event);
          });
        },
      }
    });

    chart.on("change:diameter", function() {
      chart.layers.base
        .attr("transform", "translate(" + (chart._width - chart._diameter) / 2 + "," + (chart._height - chart._diameter) / 2 + ")");
    });
  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout
      .size([chart._diameter, chart._diameter])
      .sort(null)
      .padding(1.5)
      .nodes(chart._bubble.flatten ? chart._bubble.flatten(root) : root);
  },


  diameter: function(_) {
    if( ! arguments.length ) {
      return this._diameter;
    }

    this._diameter = _ - 10;

    this.trigger("change:diameter");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },


  bubble: function(_) {
    if( ! arguments.length ) {
      return this._bubble;
    }

    var chart = this;

    ["flatten", "title", "pack"].forEach(function(func) {
      if( func in _ ) {
        this[func] = d3.functor(_[func]);
      }
    }, this._bubble = {
       flatten : null,
       title   : function(d) { return d[chart._value]; },
       pack    : function(d) { return d[chart._name]; }
      }
    );

    chart.trigger("change:formats");
    if( chart.root ) {
      chart.draw(chart.root);
    }

    return chart;
  },

});




d3.chart("hierarchy").extend("pack.nested", {

  initialize : function() {
    var chart = this;
    
    chart.d3.layout = d3.layout.pack();

    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

    chart.diameter(chart._diameter || Math.min(chart._width, chart._height));

    chart.d3.zoom.translate([(chart._width - chart._diameter) / 2, (chart._height - chart._diameter) / 2]);

    chart.layers.base
      .attr("transform", "translate(" + (chart._width - chart._diameter) / 2 + "," + (chart._height - chart._diameter) / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(data) {
        return this.selectAll(".pack").data(data);
      },

      insert: function() {
        return this.append("g").classed("pack", true);
      },

      events: {
        "enter": function() {
          
          chart._initNode(this);

          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          this.append("circle")
            .attr("r", function(d) { return d.r; });

          this.append("text");

          this.on("click", function(event) {
            chart.trigger("pack:click", event);
          });
        },

        "merge": function() {

          chart._initNode(this);

          this.select("text")
            .style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
            .text(function(d) { return d[chart._name]; });
        },
      }
    });


    chart.on("change:diameter", function() {
      chart.layers.base
        .attr("transform", "translate(" + (chart._width - chart._diameter) / 2 + "," + (chart._height - chart._diameter) / 2 + ")");
    });
  },


  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout
      .size([chart._diameter, chart._diameter])
      .nodes(root);
  },


  diameter: function(_) {
    if( ! arguments.length ) {
      return this._diameter;
    }

    this._diameter = _ - 10;

    this.trigger("change:diameter");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  }, 


  collapsible: function() {
    var chart = this;

    var pack,
        x = d3.scale.linear().range([0, chart._diameter]),
        y = d3.scale.linear().range([0, chart._diameter]);


    chart.layers.base.on("merge", function() {
      pack = chart.root;
      chart.on("pack:click", function(d) { collapse(pack == d ? chart.root : d); });
    });


    function collapse(d) {
      var k = chart._diameter / d.r / 2;

      x.domain([d.x - d.r, d.x + d.r]);
      y.domain([d.y - d.r, d.y + d.r]);

      var t = chart.layers.base.transition()
        .duration(chart._duration);

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

    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

    chart.diameter(chart._diameter || Math.min(chart._width, chart._height));

    chart.d3.x   = d3.scale.linear().range([0, 2 * Math.PI]);
    chart.d3.y   = d3.scale.sqrt().range([0, chart._diameter / 2]);
    chart.d3.arc = d3.svg.arc()
      .startAngle(function(d)  { return Math.max(0, Math.min(2 * Math.PI, chart.d3.x(d.x))); })
      .endAngle(function(d)    { return Math.max(0, Math.min(2 * Math.PI, chart.d3.x(d.x + d.dx))); })
      .innerRadius(function(d) { return Math.max(0, chart.d3.y(d.y)); })
      .outerRadius(function(d) { return Math.max(0, chart.d3.y(d.y + d.dy)); });

    chart.d3.zoom.translate([chart.base.attr("width") / 2, chart.base.attr("height") / 2]);

    chart.layers.base
      .attr("transform", "translate(" + chart.base.attr("width") / 2 + "," + chart.base.attr("height") / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(data) {
        return this.selectAll("path").data(data);
      },

      insert: function() {
        return this.append("path");
      },

      events: {
        "enter": function() {
          this.attr("d", chart.d3.arc)
            .style("fill", function(d) { return chart.d3.colorScale((d.children ? d : d.parent)[chart._name]); });

          this.on("click", function(event) {
            chart.trigger("path:click", event);
          });
        }
      }
    });


    chart.on("change:radius", function() {
      chart.layers.paths
        .attr("transform", "translate(" + chart.base.attr("width") / 2 + "," + chart.base.attr("height") / 2 + ")");

      chart.d3.y = d3.scale.sqrt().range([0, chart._diameter / 2]);
    });

  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout.nodes(root);
  },


  diameter: function(_) {
    if( ! arguments.length ) {
      return this._diameter;
    }

    this._diameter = _ - 10;

    this.trigger("change:radius");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },


  collapsible: function() {
    var chart = this;

    chart.layers.base.on("merge", function() {
      var path = this;
      chart.on("path:click", function(d) {
          path.transition()
            .duration(chart._duration)
            .attrTween("d", arcTween(d));
        });
    });

    function arcTween(d) {
      var xd = d3.interpolate(chart.d3.x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(chart.d3.y.domain(), [d.y, 1]),
          yr = d3.interpolate(chart.d3.y.range(),  [d.y ? 20 : 0, chart._diameter / 2]);

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

    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

   
    var x = d3.scale.linear().range([0, chart._width]),
        y = d3.scale.linear().range([0, chart._height]);

    chart.d3.transform = function(d, ky) { return "translate(8," + d.dx * ky / 2 + ")"; };


    chart.layer("base", chart.layers.base, {

      dataBind: function(data) {
        return this.selectAll(".partition").data(data);
      },

      insert: function() {
        return this.append("g").classed("partition", true);
      },

      events: {
        "enter": function() {

          chart._initNode(this);
          
          this.attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

          var kx = chart._width  / chart.root.dx,
              ky = chart._height / 1; 

          this.append("rect")
            .attr("width", chart.root.dy * kx)
            .attr("height", function(d) { return d.dx * ky; }); 

          this.append("text")
            .attr("transform", function(d) { return chart.d3.transform(d, ky); })
            .attr("dy", ".35em")
            .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
            .text(function(d) { return d[chart._name]; });

          this.on("click", function(event) {
            chart.trigger("rect:click", event);
          });
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

    var node,
        x = d3.scale.linear(),
        y = d3.scale.linear().range([0, chart._height]);

    chart.layers.base.on("merge", function() {
      node = chart.root;
      chart.on("rect:click", function(d) { collapse(node == d ? chart.root : d); });
    });

    function collapse(d) {
      var kx = (d.y ? chart._width - 40 : chart._width) / (1 - d.y),
          ky = chart._height / d.dx;

      x.domain([d.y, 1]).range([d.y ? 40 : 0, chart._width]);
      y.domain([d.x, d.x + d.dx]);

      var t = chart.layers.base.transition()
        .duration(chart._duration);

      t.selectAll(".partition")
        .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

      t.selectAll("rect")
        .attr("width", d.dy * kx)
        .attr("height", function(d) { return d.dx * ky; });

      t.selectAll("text")
        .attr("transform", function(d) { return chart.d3.transform(d, ky); })
        .style("opacity",  function(d) { return d.dx * ky > 12 ? 1 : 0; });

      node = d;
    }
  
    return chart;
  },
});




d3.chart("hierarchy").extend("treemap", {
 
  initialize : function() {

    var chart = this;

    chart.d3.layout = d3.layout.treemap();

    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

    chart.layer("base", chart.layers.base, {

      dataBind: function(data) {
        return this.selectAll(".cell").data(data);
      },

      insert: function() {
        return this.append("g").classed("cell", true);
      },

      events: {
        "enter": function() {

          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          
          this.append("rect")
            .attr("width", function(d) { return d.dx; })
            .attr("height", function(d) { return d.dy; })
            .attr("fill", function(d) { return d.parent ? chart.d3.colorScale(d.parent[chart._name]) : null; });

          this.append("text")
            .attr("x", function(d) { return d.dx / 2; })
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .text(function(d) { return d.children ? null : d[chart._name]; }) // order is matter! getComputedTextLength
            .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

          this.on("click", function(event) {
            chart.trigger("rect:click", event);
          });
        },
      }
    });
  },


  transform: function(root) {
    var chart  = this;

    chart.root = root;

    return chart.d3.layout
      .round(false)
      .size([chart._width, chart._height])
      .sticky(true)
      .nodes(root);
  },


  collapsible: function() {
    var chart = this;

    var node,
        x = d3.scale.linear().range([0, chart._width]),
        y = d3.scale.linear().range([0, chart._height]);

    chart.layers.base.on("merge", function() {
      node = chart.root;
      chart.on("rect:click", function(d) { collapse(node == d.parent ? chart.root : d.parent); });
    });

    function collapse(d) {
      var kx = chart._width  / d.dx,
          ky = chart._height / d.dy;

      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      var t = chart.layers.base.transition()
        .duration(chart._duration);

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




}(window.d3));

