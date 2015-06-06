
d3.chart("hierarchy").extend("pack.nested", {

  initialize : function() {
    var chart = this;
    
    chart.d3.layout = d3.layout.pack();

    chart.diameter(chart.features.diameter || Math.min(chart.features.width, chart.features.height));

    chart.d3.zoom.translate([(chart.features.width - chart.features.diameter) / 2, (chart.features.height - chart.features.diameter) / 2]);

    chart.layers.base
      .attr("transform", "translate(" + (chart.features.width - chart.features.diameter) / 2 + "," + (chart.features.height - chart.features.diameter) / 2 + ")");


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
            .text(function(d) { return d[chart.features.name]; });
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
      .nodes(root);
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


  collapsible: function() {
    var chart = this;

    var pack,
        x = d3.scale.linear().range([0, chart.features.diameter]),
        y = d3.scale.linear().range([0, chart.features.diameter]);


    chart.layers.base.on("merge", function() {
      pack = chart.root;
      chart.on("pack:click", function(d) { collapse(pack == d ? chart.root : d); });
    });


    function collapse(d) {
      var k = chart.features.diameter / d.r / 2;

      x.domain([d.x - d.r, d.x + d.r]);
      y.domain([d.y - d.r, d.y + d.r]);

      var t = chart.layers.base.transition()
        .duration(chart.features.duration);

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


