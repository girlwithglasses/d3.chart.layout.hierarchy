
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


