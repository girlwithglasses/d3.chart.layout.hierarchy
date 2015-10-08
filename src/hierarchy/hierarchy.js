
d3.chart("hierarchy", {

  initialize: function() {
    var chart = this;

    chart.options = {};
    chart.d3      = {};
    chart.layers  = {};

    chart.base.attr("width",  chart.base.node().parentNode.clientWidth);
    chart.base.attr("height", chart.base.node().parentNode.clientHeight);

    chart.options.width  = chart.base.attr("width");
    chart.options.height = chart.base.attr("height");

    chart.d3.colorScale = chart.options.colors ? d3.scale.ordinal().range(chart.options.colors) : d3.scale.category20c();
    chart.d3.zoom       = d3.behavior.zoom();

    chart.layers.base = chart.base.append("g");
    
    chart.name(chart.options.name         || "name");
    chart.value(chart.options.value       || "value");
    chart.duration(chart.options.duration || 750);


    chart._internalUpdate = false;


    chart.off("change:value").on("change:value", function() {
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

    return nodes.reverse();
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


