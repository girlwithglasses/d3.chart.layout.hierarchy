
d3.chart("hierarchy").extend("pack.flattened", {

  initialize : function() {

    var chart = this;

    chart.d3.layout = d3.layout.pack();
   
    chart.bubble(chart.features.bubble     || {});
    chart.diameter(chart.features.diameter || Math.min(chart.features.width, chart.features.height));

    chart.d3.zoom.translate([(chart.features.width - chart.features.diameter) / 2, (chart.features.height - chart.features.diameter) / 2]);

    chart.layers.base
      .attr("transform", "translate(" + (chart.features.width - chart.features.diameter) / 2 + "," + (chart.features.height - chart.features.diameter) / 2 + ")");


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
            .style("fill", function(d) { return chart.d3.colorScale(chart.features.bubble.pack(d)); });

          this.append("text")
            .attr("dy", ".3em")
            .text(function(d) { return d[chart.features.name].substring(0, d.r / 3); });

          this.append("title")
            .text(chart.features.bubble.title);

          this.on("click", function(event) {
            chart.trigger("pack:click", event);
          });
        },
      }
    });

    chart.on("change:diameter", function() {
      chart.layers.base
        .attr("transform", "translate(" + (chart.features.width - chart.features.diameter) / 2 + "," + (chart.features.height - chart.features.diameter) / 2 + ")");
    });
  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout
      .size([chart.features.diameter, chart.features.diameter])
      .padding(1.5)
      .nodes(chart.features.bubble.flatten ? chart.features.bubble.flatten(root) : root);
  },


  diameter: function(_) {
    if( ! arguments.length ) {
      return this.features.diameter;
    }

    this.features.diameter = _ - 10;

    this.trigger("change:diameter");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },


  bubble: function(_) {
    if( ! arguments.length ) {
      return this.features.bubble;
    }

    var chart = this;

    ["flatten", "title", "pack"].forEach(function(func) {
      if( func in _ ) {
        this[func] = d3.functor(_[func]);
      }
    }, this.features.bubble = {
       flatten : null,
       title   : function(d) { return d[chart.features.value]; },
       pack    : function(d) { return d[chart.features.name]; }
      }
    );

    chart.trigger("change:formats");
    if( chart.root ) {
      chart.draw(chart.root);
    }

    return chart;
  },

});


