
d3.chart("hierarchy", {

  initialize: function() {

    this.d3     = {};
    this.layers = {};

    this.base.attr("width",  this.base.node().parentNode.clientWidth);
    this.base.attr("height", this.base.node().parentNode.clientHeight);

    this.d3.zoom = d3.behavior.zoom();
    this.layers.base = this.base.append("g");
    
    this.name(this._name         || "name");
    this.value(this._value     || "value");
    this.duration(this._duration || 750);
  },



  name: function(_) {
    if (!arguments.length) {
      return this._name;
    }

    this._name = _;

    this.trigger("change:name");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },


  value: function(_) {
    if (!arguments.length) {
      return this._value;
    }

    this._value = _;

    this.trigger("change:value");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },


  duration: function(_) {
    if (!arguments.length) {
      return this._duration;
    }

    this._duration = _;

    this.trigger("change:duration");
    if (this.root) {
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
});


