(function (d3) {
  'use strict';

  d3.chart("cluster-tree.radial").extend("tree.radial", {

    initialize: function () {
      this.d3.layout = d3.layout.tree();
    }

  });

})(d3);
