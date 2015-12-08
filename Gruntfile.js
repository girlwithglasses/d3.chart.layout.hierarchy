
module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({

    meta: {
      pkg: grunt.file.readJSON("package.json"),

      source: ["src/**/*.js"],

      banner: "/*!\n" +
              " * <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n" +
              " * <%= meta.pkg.homepage %>\n" +
              " * \n" +
              " * Copyright (c) 2015 <%= meta.pkg.author %>\n" +
              " * Library released under <%= meta.pkg.license %> license.\n" +
              " */\n"
    },

    watch: {
      scripts: {
        files: "<%= meta.source %>",
        tasks: ["concat"]
      }
    },

    jshint: {
      options: {
        curly: true,
        undef: true
      },
      chart: {
        options: {
          browser: true,
          globals: {
            d3: true
          }
        },
        files: {
          src: "<%= meta.source %>"
        }
      },
      grunt: {
        options: {
          node: true
        },
        files: {
          src: ["Gruntfile.js"]
        }
      }
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      build: {
        files: {
          "d3.chart.layout.hierarchy.js":
          [
            "src/start.frag",

            "src/hierarchy/hierarchy.js",

            "src/hierarchy/cluster-tree.js",
            "src/hierarchy/cluster-tree.cartesian.js",
            "src/hierarchy/cluster-tree.radial.js",

            "src/cluster/cluster.cartesian.js",
            "src/cluster/cluster.radial.js",
            "src/tree/tree.cartesian.js",
            "src/tree/tree.radial.js",
            "src/pack/pack.flattened.js",
            "src/pack/pack.nested.js",
            "src/partition/partition.arc.js",
            "src/partition/partition.rectangle.js",
            "src/treemap/treemap.js",

            "src/hierarchy/diagonal.js",

            "src/end.frag"
          ]
        }
      }
    },

    uglify: {
      options: {
        preserveComments: "false"
      },
      release: {
        files: {
          "d3.chart.layout.hierarchy.min.js": "d3.chart.layout.hierarchy.js"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["jshint", "concat"]);
  grunt.registerTask("release", ["jshint", "concat", "uglify"]);
};

