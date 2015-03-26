module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({

    meta: {
      pkg: grunt.file.readJSON("package.json"),

      srcFiles: ["src/**/*.js", '!src/start.js', '!src/end.js'],

      banner: "/*!\n" +
              " * <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n" +
              " * <%= meta.pkg.homepage %>\n" +
              " * \n" +
              " * Copyright (c) 2015 <%= meta.pkg.author.name %>\n" +
              " * Library released under <%= meta.pkg.license.type %> license.\n" +
              " */\n"
    },

    watch: {
      scripts: {
        files: "<%= meta.srcFiles %>",
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
          src: "<%= meta.srcFiles %>"
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
      stage: {
        files: {
          "stage/parents.js": [
            "src/hierarchy/hierarchy.js",
            "src/hierarchy/cluster-tree.js",
            "src/hierarchy/cluster-tree.cartesian.js",
            "src/hierarchy/cluster-tree.radial.js"
          ],
          "stage/children.js": [
            "src/cluster/cluster.cartesian.js",
            "src/cluster/cluster.radial.js",
            "src/pack/pack.flattened.js",
            "src/pack/pack.nested.js",
            "src/partition/partition.arc.js",
            "src/partition/partition.rectangle.js",
            "src/tree/tree.cartesian.js",
            "src/tree/tree.radial.js",
            "src/treemap/treemap.js"
          ]
        }
      },
      release: {
        options: {
          banner: "<%= meta.banner %>"
        },
        files: {
          "d3.chart.layout.hierarchy.js": [
            "src/start.js",
            "stage/parents.js",
            "stage/children.js",
            "src/end.js"
          ]
        }
      }
    },

    uglify: {
      options: {
        preserveComments: "some"
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

  grunt.registerTask("default", ["concat"]);
  grunt.registerTask("release", ["jshint", "concat", "uglify"]);
};

