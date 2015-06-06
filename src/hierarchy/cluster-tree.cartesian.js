
d3.chart("cluster-tree").extend("cluster-tree.cartesian", {

  initialize : function() {

    var chart = this;

    chart.margin(chart.features.margin || {});

    chart.d3.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });


    chart.layers.nodes.on("enter", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y0 + "," + chart.source.x0 + ")"; });

      this.select("text")
        .attr("x", function(d) { return d.isLeaf ? 10 : -10; })
        .attr("text-anchor", function(d) { return d.isLeaf ? "start" : "end"; });
    });

    chart.layers.nodes.on("merge:transition", function() {
      this.duration(chart.features.duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
    });

    chart.layers.nodes.on("exit:transition", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y + "," + chart.source.x + ")"; });
    });


    chart.on("change:margin", function() {
      chart.features.width  = chart.base.attr("width")  - chart.features.margin.left - chart.features.margin.right;
      chart.features.height = chart.base.attr("height") - chart.features.margin.top  - chart.features.margin.bottom;
      chart.base.attr("transform", "translate(" + chart.features.margin.left + "," + chart.features.margin.top + ")");
    });
  },



  transform: function(root) {
    var chart = this,
        nodes;

    chart.source = root;

    if( ! chart.root ) {
      chart.root    = root;
      chart.root.x0 = chart.features.height / 2;
      chart.root.y0 = 0;

      nodes = chart.d3.layout
        .size([chart.features.height, chart.features.width])
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
      return this.features.margin;
    }

    ["top", "right", "bottom", "left"].forEach(function(dimension) {
      if( dimension in _ ) {
        this[dimension] = _[dimension];
      }
    }, this.features.margin = { top: 0, right: 0, bottom: 0, left: 0 });

    this.trigger("change:margin");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },
});


