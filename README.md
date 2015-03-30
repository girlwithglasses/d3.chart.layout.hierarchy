
# d3.chart.layout.hierarchy

Collection of interactive and reusable [D3 hierarchy layouts](https://github.com/mbostock/d3/wiki/Hierarchy-Layout) built with [d3.Chart](http://misoproject.com/d3-chart/) framework.


The input is a vertex-labeled rooted tree, and the output is a zoomable, collapsible hierarchy layout.

For more information [see the Wiki](https://github.com/bansaghi/d3.chart.layout.hierarchy/wiki).

## Example bl.ocks

##### Cluster Layout
* [Cartesian Cluster](http://bl.ocks.org/bansaghi/ffc9d995f77e9ccd4ea9)
* [Radial Cluster](http://bl.ocks.org/bansaghi/e490c7c238a67a77996d)

##### Pack Layout
* [Nested Pack](http://bl.ocks.org/bansaghi/4b542562da43e1ae3e40)
* [Flattened Pack](http://bl.ocks.org/bansaghi/7588173d69ec85451ee2)

##### Partition Layout
* [Arc Partition](http://bl.ocks.org/bansaghi/2617fed0c286365c7f49)
* [Rectangle Partition](http://bl.ocks.org/bansaghi/4fde0154055c0f0580b7)

##### Tree Layout
* [Cartesian Tree](http://bl.ocks.org/bansaghi/b0e74b395d1909657ded)
* [Radial Tree](http://bl.ocks.org/bansaghi/f3cbb5e7b759b6a58aff)

##### Treemap Layout
* [Treemap](http://bl.ocks.org/bansaghi/5d24b37ebe077d4e919f)



## Build Instructions

Build requirements:

- [Node.js](http://nodejs.org)
- [Grunt](http://gruntjs.com)
- [Bower](http://bower.io/)

To fetch required dependencies, run the following command from the root of this repository:

    $ npm install
    $ bower install

After this, the project can be built by invoking Grunt from within this repository:

    $ grunt
    
To build the project along with minified version of the library, run:

    $ grunt release



## Download

If you do not want to build the library, you can download it directly and embed it using a script tag.

`d3.chart.layout.hierarchy` depends on [`d3.chart`](http://misoproject.com/d3-chart/) which depends on [`d3`](http://d3js.org/), so include them in reverse order:

```javascript
<script src="scripts/lib/d3.v3.min.js"></script>
<script src="scripts/lib/d3.chart.min.js"></script>
<script src="scripts/lib/d3.chart.layout.hierarchy.min.js"></script>
```
