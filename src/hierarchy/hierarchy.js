
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


