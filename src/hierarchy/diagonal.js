/*jshint laxcomma: true */
/* global d3 */
  'use strict';

/** adapted from kueda's d3.phylogram.js */

d3.svg.diagonal_extras = {
    // helper function for getting types
    _get_type: function(elem) {
      return Object.prototype.toString.call(elem).slice(8, -1);
    }

    , path: {
      // diagonal line
      direct: function(p){
        return [ p.source, p.target ];
      }

      // this is also the default path in radial trees
      , l_shape: function(p){
        return [ p.source, { x: p.target.x, y: p.source.y }, p.target ];
      }

      , l_shape_2: function(p){
        return [ p.source, { x: p.source.x, y: p.target.y }, p.target ];
      }

      , dogleg: function(p){
        return [ p.source,
        {   x: p.source.x,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: p.target.x,
            y: (p.source.y + p.target.y) / 2
        }, p.target];
      }

      , dogleg_2: function(p){
        return [ p.source,
        {   x: (p.source.x + p.target.x) / 2,
            y: p.source.y
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: (p.source.y + p.target.y) / 2
        },
        {   x: (p.source.x + p.target.x) / 2,
            y: p.target.y
        }, p.target];
      }

    }

    , right_angle: function() {

      var projection = d3.svg.diagonal().projection()

      , path = function(pathData) {
        return "M" + pathData.join(' ');
      }
      , path_type = 'dogleg'

      , path_maker = function( pathData ) {
        return "M" + pathData.map( projection ).join(' ');
      };

      function diagonal(d) {
        return diagonal.path_maker( d3.svg.diagonal_extras.path[ diagonal.path_type() ](d) );
      }

      diagonal.path_maker = function( pathData ) {
        return "M" + pathData.map( projection ).join(' ');
      };

      diagonal.valid_path_types = function() {
        return Object.keys( d3.svg.diagonal_extras.path );
      };

      diagonal.path_type = function(x) {
        if (! arguments.length) { return path_type; }
        if ( d3.svg.diagonal_extras.path[ x ] ) {
          path_type = x;
          return diagonal;
        }
        throw new Error( x + ' is not a valid path type' );
      };

      diagonal.projection = function(x) {
        if (!arguments.length) { return projection; }
        projection = x;
        return diagonal;
      };

      diagonal.path = function(x) {
        if (!arguments.length) { return path; }
        path = x;
        return diagonal;
      };

      return diagonal;
    }

    , radial: function() {

      var diagonal = d3.svg.diagonal_extras.right_angle()

      , projection = function(pt){
        return [ pt.x, pt.y ];
      }

      , polar_obj_to_cart = function(pt){
          var angle = pt.x / 180 * Math.PI;
          return [pt.y * Math.cos(angle), pt.y * Math.sin(angle)];
      }
      , polar_coords_to_cart = function(xy){
          var angle = xy[0] / 180 * Math.PI;
          return [ xy[1] * Math.cos(angle), xy[1] * Math.sin(angle)];
      }
      ;

      diagonal.path_type('direct');

      diagonal.projection = function(x) {
        if (!arguments.length) { return projection; }
        projection = x;
        return diagonal;
      };

      diagonal.path_maker = function( pathData ) {

        var projected = pathData.map( function(x){ return projection(x); })
        , pl = projected.length
        , points
        , prev_angle
        ;

        // direct link:
        if ( 2 === pl ) {
          return 'M' + projected.map( function(x){ return polar_coords_to_cart(x); }).join(' ');
        }

//         if ( projected[0].x === projected[ pl-1 ].x && projected[0].y === projected[ pl-1 ].y) {
//           return 'M' + polar_coords_to_cart( projected[0] ) + ' ' + polar_coords_to_cart( projected[ pl-1 ] );
//         }

        points = projected.map( function(obj){
          return { angle: obj[0] / 180 * Math.PI, radius: obj[1] };
        });

        return "M" + points.map( function(pt){
          var str = '';
          if ( prev_angle ) {
            if ( prev_angle === pt.angle ) {
              // draw a straight line
              str = 'L';
            }
            else {
              // draw an arc to the new radius and angle
              str = 'A' + pt.radius + ',' + pt.radius + " 0 0 "
              + (pt.angle > prev_angle ? 1 : 0) + " ";
            }
          }
          prev_angle = pt.angle;
          return str + pt.radius * Math.cos(pt.angle) + "," + pt.radius * Math.sin(pt.angle);

        }).join(' ');

      };
      return diagonal;
    }
};
