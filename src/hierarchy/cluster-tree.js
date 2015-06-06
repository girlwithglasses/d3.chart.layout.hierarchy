
d3.chart("hierarchy").extend("cluster-tree", {

  initialize : function() {

    var chart = this;

    var counter = 0;

    chart.radius(chart.features.radius     || 4.5);
    chart.levelGap(chart.features.levelGap || "auto");

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
            .text(function(d) { return d[chart.features.name]; })
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
            .attr("r", chart.features.radius);

          this.select("text")
            .style("fill-opacity", 1);
        },

        "exit:transition": function() {
          this.duration(chart.features.duration)
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
          this.duration(chart.features.duration)
            .attr("d", chart.d3.diagonal);
        },

        "exit:transition": function() {
          this.duration(chart.features.duration)
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
    if( chart.features.levelGap && chart.features.levelGap !== "auto" ) {
      nodes.forEach(function (d) { d.y = d.depth * chart.features.levelGap; });
    }
    
    return nodes;
  },



  radius: function(_) {
    if( ! arguments.length ) {
      return this.features.radius;
    }

    if( _ === "_COUNT" ) {
      this.features.radius = function(d) {
        if( d._children ) {
          return d._children.length;
        } else if( d.children ) {
          return d.children.length;
        }
        return 1;
      };

    } else {
      this.features.radius = _;
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
      return this.features.levelGap;
    }

    this.features.levelGap = _;
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


