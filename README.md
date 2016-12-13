# JSONtoGraph
Render graph from JSON using D3 library <br>
https://mastnova.github.io/JSONtoGraph/

## JSON format
```
{"graph":[
  {
    "id": "7727585",
    "edges": [
      {"id": "7727586"},
      {"id": "7727587"}
    ]
  }
 ]
}     
```
## Additional node properties

```
{
  "id": "7727585",
  "name": "Mark",
  "color": "DarkOrange",
  "radius": "15"
  "edges": []
}
 ```
## Default graph settings
**isDirected**
<br>
*type: Boolean*<br>
Replacing edges on arrows for directed graph representation. 

**nodeColor**
<br>
*type: String*<br>
Set color for nodes that have not own color.

**nodeRadius**
<br>
*type: Number*<br>
Set radius for nodes that have not own radius.

**linkColor**
<br>
*type: String*<br>
Set color for edges

**highlightLinkColor**
<br>
*type: String*<br>
Set highlighting color for edges

**spread**
<br>
*type: Number*<br>
Set graph spread intensity. 

**linkLength**
<br>
*type: Number*<br>
Set edges length between nodes.
