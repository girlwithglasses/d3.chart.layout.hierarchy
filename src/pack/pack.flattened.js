
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


