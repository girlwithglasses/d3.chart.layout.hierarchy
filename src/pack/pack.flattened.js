
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


