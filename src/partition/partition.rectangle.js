
d3.chart("hierarchy").extend("partition.rectangle", {

  initialize : function() {

    var chart = this;

    chart.d3.layout = d3.layout.partition();

    chart.d3.x_scale = d3.scale.linear().range([0, chart.options.width]);
    chart.d3.y_scale = d3.scale.linear().range([0, chart.options.height]);

    chart.d3.transform = function(d, ky) { return "translate(8," + d.dx * ky / 2 + ")"; };
    chart.layers.base.classed('Blues', true);

    chart.layer("base", chart.layers.base, {

      dataBind: function(nodes) {
        return this.selectAll(".partition").data(nodes);
      },

      insert: function() {
        return this.append("g").classed("partition", true);
      },

      events: {
        "enter": function() {

          this.attr("transform", function(d) { return "translate(" + chart.d3.x_scale(d.y) + "," + chart.d3.y_scale(d.x) + ")"; });

          this.attr('class', function(d){ return 'partition q' + d.depth + '-9'; })
          .classed("leaf", function(d) { return d.isLeaf; });


          var kx = chart.options.width  / chart.root.dx,
              ky = chart.options.height / 1;

          this.append("rect")
            .attr("width", chart.root.dy * kx)
            .attr("height", function(d) { return d.dx * ky; });

          this.append("text")
            .attr("transform", function(d) { return chart.d3.transform(d, ky); })
            .attr("dy", ".35em")
            .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
            .text(function(d) { return d[chart.options.name]; });

          this.on("click", function(event) { chart.trigger("click:rect", event); });
        }
      }
    });
  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout.nodes(root);
  },


  collapsible: function() {
    var chart = this;

    var node
      , details = d3.selectAll('.js_sample_details')
      ;

    chart.layers.base.on('enter', function(){
//      d3.select( '#' + chart.root.path ).classed('js_hide', true);
      details.classed('js_hide', true);
    });
    chart.layers.base.on("merge", function() {
      node = chart.root;
      chart.off("click:rect").on("click:rect", function(d) {

        details.classed('js_hide', true);
        if ( d.isLeaf ) {
          d3.select('#taxon_oid_' + d.data.taxon_oid)
            .classed('js_hide', false);
        }
//         d3.select( (node.isLeaf
//         ? '#taxon_oid_' + node.data.taxon_oid
//         : '#' + node.path ) ).classed('js_show', false);
//
//         d3.select( (d.isLeaf
//         ? '#taxon_oid_' + d.data.taxon_oid
//         : '#' + d.path ) ).classed('js_show', true);

        node = (
          d.isLeaf
          ? this.leaf_handler(d)
          : this.collapse(node == d ? chart.root : d)
        );
      });
    });

    return chart;
  },

  leaf_handler: function(d) {
    return this.collapse(d);
  },

  collapse: function(d) {
      var chart = this
        , offset = 20
        , kx = (d.y ? chart.options.width - offset : chart.options.width) / (1 - d.y)
        , ky = chart.options.height / d.dx
      /* START INSERT: add extra space on the top and bottom to allow easier access to vertically-adjacent partitions */
        , t_off = 0
        , b_off = 0
        , new_ky
        ;
        if ( 1 !== d.dx ) {
          // top of the vis
          if ( ! d.x ) {
            b_off = offset;
          }
          else {
            var total = d.x + d.dx;
            // bottom of the vis
            if ( 1 == total.toFixed(3) ) {
                t_off = offset;
            }
            else {
                // between two rects
                b_off = offset;
                t_off = offset;
            }
          }
        }

        // update the scales
        // y axis total range
        new_ky = ( chart.options.height - b_off - t_off ) / d.dx;

        if ( new_ky < chart.options.height ) {
          new_ky = chart.options.height;
          b_off = 0;
          t_off = 0;
        }

        /* END INSERT */
      chart.d3.x_scale.domain([d.y, 1]).range([d.y ? offset : 0, chart.options.width]);

      offset = offset / new_ky;
      chart.d3.y_scale.domain([ d.x - ( t_off ? offset : 0 ), d.x + d.dx + ( b_off ? offset : 0 ) ]);

      var t = chart.layers.base.transition()
        .duration(chart.options.duration);

      t.selectAll(".partition")
        .attr("transform", function(d) { return "translate(" + chart.d3.x_scale(d.y) + "," + chart.d3.y_scale(d.x) + ")"; });

      t.selectAll("rect")
        .attr("width", d.dy * kx)
        .attr("height", function(d) { return d.dx * ky; });

      t.selectAll("text")
        .attr("transform", function(d) { return chart.d3.transform(d, ky); })
        .style("opacity",  function(d) { return d.dx * ky > 12 ? 1 : 0; });

      return d;
    }


});


