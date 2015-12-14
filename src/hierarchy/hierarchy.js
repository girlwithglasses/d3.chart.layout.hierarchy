
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


