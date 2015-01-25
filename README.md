
# d3.chart.layout **v0.2.0**

## d3.chart.layout.hierarchy

Collection of interactive and reusable [d3 hierarchy layouts](https://github.com/mbostock/d3/wiki/Hierarchy-Layout) built with [d3.chart](http://misoproject.com/d3-chart/) framework.

  - [Cluster](#cluster)
  - [Pack](#pack)
  - [Partition](#partition)
  - [Tree](#tree)
  - [Treemap](#treemap)


The input is a vertex-labeled rooted tree, called hierarchy:

```javascript
{ "name": "Root",
  "children": [
    { "name": "Leaf 1", "value": 3 }, 
    { "name": "Node 1",
      "children": [
        { "name": "Leaf 2", "value": 6 }, 
        { "name": "Node 2",
          "children": [
            { "name": "Leaf 3", "value": 2 }, 
            { "name": "Leaf 4", "value": 8 }
          ]
        }
      ]
    }
  ]
}
```

## <a id="cluster"></a> Cluster Layout

View [cartesian cluster demo](http://bl.ocks.org/bansaghi/ffc9d995f77e9ccd4ea9) and [radial cluster demo](http://bl.ocks.org/bansaghi/e490c7c238a67a77996d)

#### Sample Use

```javascript
var cluster = d3.select("#vis")
  .append("svg")
  .chart("cluster.cartesian")
    .value("size")
    .margin({ top: 0, right: 60, bottom: 0, left: 60 })
    .radius(3)
    .zoomable([0.1, 3])
    .collapsible(1)
    .duration(200);

cluster.draw(data);
```

```javascript
var cluster = d3.select("#vis")
  .append("svg")
  .chart("cluster.radial")
    .value("size")
    .diameter(350)
    .radius(3)
    .zoomable([0.1, 3])
    .collapsible(2)
    .duration(200);

cluster.draw(data);
```



#### API

cluster.<b>name</b>([<i>name</i>]) - get or set the text accessor of a cluster. If not specified, returns the current text accessor, which assumes that each node has a textual `name` attribute.

[cluster.<b>value</b>([<i>value</i>])](https://github.com/mbostock/d3/wiki/Cluster-Layout#value) - get or set the value accessor of a cluster. If not specified, returns the current value accessor, which assumes that each node has a numeric `value` attribute.

[cluster.<b>duration</b>([<i>duration</i>])](https://github.com/mbostock/d3/wiki/Transitions#duration) - specify per-element duration in milliseconds. If not specified, a default of `750` is used.

[cluster.<b>radius</b>([<i>length</i>])](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/r) - specify the node radius. If not specified, a default of `4.5` pixels is used.

cluster.<b>collapsible</b>([<i>depth</i>]) - apply the collapse behavior to the cluster with the initial depth of the collapsed nodes. If not specified, returns the current depth, which defaults to `Infinity`.

[cluster.<b>zoomable</b>([<i>scaleExtent</i>])](https://github.com/mbostock/d3/wiki/Zoom-Behavior) - apply the zoom behavior with two-element array for the range.  If not specified, a default of `[0, Infinity]` is used.


[clusterCartesian.<b>margin</b>([<i>values</i>])](http://bl.ocks.org/mbostock/3019563) - get or set the margin object with properties for the four sides. If not specified, a default of `{ top: 0, right: 0, bottom: 0, left: 0 }` is used.

clusterRadial.<b>diameter</b>([<i>value</i>]) - get or set the diameter of the cluster. If not specified, a default of the minimum of the `width` and `height` is used.


## <a id="pack"></a> Pack Layout

View [nested pack demo](http://bl.ocks.org/bansaghi/4b542562da43e1ae3e40) and [flattened pack demo](http://bl.ocks.org/bansaghi/7588173d69ec85451ee2)


#### Sample Use

```javascript
var pack = d3.select("#vis")
  .append("svg")
  .chart("pack.nested")
    .value("size")
    .diameter(350)
    .zoomable([0.1, 3])
    .collapsible()
    .duration(200);

pack.draw(data);
```

```javascript
function classes(root) {...};
function title(d) {...};
function fill(d) {...};

var pack = d3.select("#vis")
  .append("svg")
  .chart("pack.flattened")
    .name("className")
    .flatten(classes)
    .formats({ title: title, fill: fill })
    .diameter(350)
    .zoomable([0.1, 3])
    .duration(200);

pack.draw(data);
```

#### API

pack.<b>name</b>([<i>name</i>]) - get or set the text accessor of a pack. If not specified, returns the current text accessor, which assumes that each node has a textual `name` attribute.

[pack.<b>value</b>([<i>value</i>])](https://github.com/mbostock/d3/wiki/Pack-Layout#value) - get or set the value accessor of a pack. If not specified, returns the current value accessor, which assumes that each node has a numeric `value` attribute.

[pack.<b>duration</b>([<i>duration</i>])](https://github.com/mbostock/d3/wiki/Transitions#duration) - specify per-element duration in milliseconds. If not specified, a default of `750` is used.

pack.<b>diameter</b>([<i>value</i>]) - get or set the diameter of the pack. If not specified, a default of the minimum of the `width` and `height` is used.

[pack.<b>zoomable</b>([<i>scaleExtent</i>])](https://github.com/mbostock/d3/wiki/Zoom-Behavior) - apply the zoom behavior with two-element array for the range. If not specified, a default of `[0, Infinity]` is used.

packNested.<b>collapsible</b>() - apply the collapse behavior to the pack.

packFlattened.<b>flatten</b>([<i>function</i>]) - specify the hierarchy flattening function.

packFlattened.<b>formats</b>([<i>formats</i>]) - get or set the formats object with properties for the formatting functions.




## <a id="partition"></a> Partition Layout

View [arc partitiion demo](http://bl.ocks.org/bansaghi/2617fed0c286365c7f49) and [rectangle partition demo](http://bl.ocks.org/bansaghi/4fde0154055c0f0580b7)

#### Sample Use

```javascript
var partition = d3.select("#vis")
  .append("svg")
  .chart("partition.arc")
    .value("size")
    .diameter(350)
    .zoomable([0.1, 3])
    .collapsible()
    .duration(200);

partition.draw(data);
```

```javascript
var partition = d3.select("#vis")
  .append("svg")
  .chart("partition.rectangle")
    .value("size")
    .zoomable([0.1, 3])
    .collapsible()
    .duration(200);

partition.draw(data);
```


#### API

partition.<b>name</b>([<i>name</i>]) - get or set the text accessor of a partition. If not specified, returns the current text accessor, which assumes that each node has a textual `name` attribute.

[partition.<b>value</b>([<i>value</i>])](https://github.com/mbostock/d3/wiki/Partition-Layout#value) - get or set the value accessor of a partition. If not specified, returns the current value accessor, which assumes that each node has a numeric `value` attribute.

[partition.<b>duration</b>([<i>duration</i>])](https://github.com/mbostock/d3/wiki/Transitions#duration) - specify per-element duration in milliseconds. If not specified, a default of `750` is used.

partition.<b>collapsible</b>() - apply the collapse behavior to the partition.

[partition.<b>zoomable</b>([<i>scaleExtent</i>])](https://github.com/mbostock/d3/wiki/Zoom-Behavior) - apply the zoom behavior with two-element array for the range. If not specified, a default of `[0, Infinity]` is used.


partitionArc.<b>diameter</b>([<i>value</i>]) - get or set the diameter of the sunburst. If not specified, a default of the minimum of the `width` and `height` is used.


## <a id="tree"></a> Tree Layout

View [cartesian tree demo](http://bl.ocks.org/bansaghi/b0e74b395d1909657ded) and [radial tree demo](http://bl.ocks.org/bansaghi/f3cbb5e7b759b6a58aff)

#### Sample Use

```javascript
var tree = d3.select("#vis")
  .append("svg")
  .chart("tree.cartesian")
    .value("size")
    .margin({ top: 0, right: 60, bottom: 0, left: 60 })
    .radius(3)
    .zoomable([0.1, 3])
    .collapsible(1)
    .duration(200);

tree.draw(data);
```

```javascript
var tree = d3.select("#vis")
  .append("svg")
  .chart("tree.radial")
    .value("size")
    .diameter(350)
    .radius(3)
    .zoomable([0.1, 3])
    .collapsible()
    .duration(200);

tree.draw(data);
```



#### API

tree.<b>name</b>([<i>name</i>]) - get or set the text accessor of a tree. If not specified, returns the current text accessor, which assumes that each node has a textual `name` attribute.

[tree.<b>value</b>([<i>value</i>])](https://github.com/mbostock/d3/wiki/Tree-Layout#value) - get or set the value accessor of a tree. If not specified, returns the current value accessor, which assumes that each node has a numeric `value` attribute.

[tree.<b>duration</b>([<i>duration</i>])](https://github.com/mbostock/d3/wiki/Transitions#duration) - specify per-element duration in milliseconds. If not specified, a default of `750` is used.

[tree.<b>radius</b>([<i>length</i>])](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/r) - specify the node radius. If not specified, a default of `4.5` pixels is used.

tree.<b>collapsible</b>([<i>depth</i>]) - apply the collapse behavior to the tree with the initial depth of the collapsed nodes. If not specified, returns the current depth, which defaults to `Infinity`.

[tree.<b>zoomable</b>([<i>scaleExtent</i>])](https://github.com/mbostock/d3/wiki/Zoom-Behavior) - apply the zoom behavior with two-element array for the range. If not specified, a default of `[0, Infinity]` is used.


[treeCartesian.<b>margin</b>([<i>values</i>])](http://bl.ocks.org/mbostock/3019563) - get or set the margin object with properties for the four sides. If not specified, a default of `{ top: 0, right: 0, bottom: 0, left: 0 }` is used.

treeRadial.<b>diameter</b>([<i>value</i>]) - get or set the diameter of the tree. If not specified, a default of the minimum of the `width` and `height` is used.



## <a id="treemap"></a> Treemap Layout

View [treemap demo](http://bl.ocks.org/bansaghi/5d24b37ebe077d4e919f)

#### Sample Use

```javascript
var treemap = d3.select("#vis")
  .append("svg")
  .chart("treemap")
    .value("size")
    .zoomable([0.1, 3])
    .collapsible()
    .duration(200);

treemap.draw(data);
```


#### API

treemap.<b>name</b>([<i>name</i>]) - get or set the text accessor of a treemap. If not specified, returns the current text accessor, which assumes that each node has a textual `name` attribute.

[treemap.<b>value</b>([<i>value</i>])](https://github.com/mbostock/d3/wiki/Treemap-Layout#value) - get or set the value accessor of a treemap. If not specified, returns the current value accessor, which assumes that each node has a numeric `value` attribute.

[treemap.<b>duration</b>([<i>duration</i>])](https://github.com/mbostock/d3/wiki/Transitions#duration) - specify per-element duration in milliseconds. If not specified, a default of `750` is used.

treemap.<b>collapsible</b>() - apply the collapse behavior to the treemap.

[treemap.<b>zoomable</b>([<i>scaleExtent</i>])](https://github.com/mbostock/d3/wiki/Zoom-Behavior) - apply the zoom behavior with two-element array for the range. If not specified, a default of `[0, Infinity]` is used.



## Changelog


* 2015/01/24 - 0.2.0 - [added] numerical argument of the collapsible property indicating if the chart is collapsed at a specific depth or not at the initial render
* 2014/11/05 - 0.1.1 - [fixed] several bugs




