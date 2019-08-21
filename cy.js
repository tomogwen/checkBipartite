var cy = cytoscape({

  container: document.getElementById('cy'), // container to render in

  elements: [ // list of graph elements to start with
      
    ],
  style: [ // the stylesheet for the graph
      {
            selector: 'node',
            style: {
                    'background-color': '#002b80',
                    'label': 'data(id)'
                  }
          },
  
      {
            selector: 'edge',
            style: {
                    'width': 3,
                    'line-color': '#6699ff',
                    'target-arrow-color': '#6699ff',
                    'target-arrow-shape': 'triangle'
                  }
          }
    ],
  layout: {
      name: 'grid',
      rows: 1
    }
});


var nodeCount = 0;
var edgeCount = 0;

/*cy.on("tap", function(e) {

    cy.add({
        group: 'nodes',
        data:{ id: nodeCount },
        renderedPosition: {
            x: e.renderedPosition.x,
            y: e.renderedPosition.y
        }
    })
    nodeCount += 1;
});*/


function runCose() {
    var options = {
        name: 'cose',
        animate: 'true'
    };
    var layout = cy.layout(options);
    layout.run();

}


function binomial(n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number')) 
        return false; 
    
    var coeff = 1;
    for (var x = n-k+1; x <= n; x++) 
        coeff *= x;
    for (x = 1; x <= k; x++) 
        coeff /= x;
    
    return coeff;
}


function randomEdges() {
    for (var i = 0; i< Math.floor(1*(nodeCount-1)); i++) {
        var startId = Math.floor(Math.random() * nodeCount); 
        var endId = startId;
        while (endId === startId) {
            endId   = Math.floor(Math.random() * nodeCount);
        }
        
        cy.add({
            group: 'edges',
            id: -edgeCount,
            data: {
                source: startId,
                target: endId
            }
        })
        edgeCount += 1;
    }
}


function randomNodes() { 
    for (var i = 0; i<10; i++) {
        cy.add({
            group: 'nodes',
            data: { id: nodeCount},
            position: {
                x: Math.floor(Math.random() * screen.height),
                y: Math.floor(Math.random() * screen.width)
            }
        })
        nodeCount += 1;
    }   
}


function deleteIsolated() { 
    cy.nodes().forEach( function(node) { 
        if(node.degree() === 0) {
            cy.remove(node);
        }
    });
}


function tryColour(initKey) {      
    var col1All = cy.collection();
    var col2All = cy.collection();
    var col1 = [];
    var col2 = [];

    col1.push(cy.collection());
    col1[0] = col1[0].union(cy.nodes()[initKey]);
    col1All = col1All.union(cy.nodes()[initKey]);

    var probNode;
    var bipartite = true;
    var count = 0;
    var nextSearch = 1;

    var cont = true;
    var stopNext = false;

    while( cont && bipartite ) {
        console.log(count);
        col2.push(cy.collection());
        for(var i = 0; i < col1[count].length; i++) {
            console.log('started at');
            console.log(col1[count][i].id());
            col1[count][i].neighbourhood().nodes().forEach( function(node) {
                if(bipartite) {
                    if(col1All.contains(node)) {
                        bipartite = false;
                        brokenNode = col1[count][i];
                        brokenNodeN = node;
                        nextSearch = 2;

                        console.log('broken at');
                        console.log(node.id());

                    } else if (!col2All.contains(node)) {
                        col2[count] = col2[count].union(node);
                        col2All = col2All.union(node);
                        
                        console.log('Added to col2');
                        console.log(node.id());
                    }
                }
            });
        }
        
        col1.push(cy.collection());
        for(var i = 0; i < col2[count].length; i++) {
            console.log('started at');
            console.log(col2[count][i].id());
            col2[count][i].neighbourhood().nodes().forEach( function(node) {
                if(bipartite) {
                    if(col2All.contains(node)) {
                        bipartite = false;
                        brokenNode = col2[count][i];
                        brokenNodeN = node;
                        nextSearch = 1;

                        console.log('broken at');
                        console.log(node.id());
                    
                    } else if (!col1All.contains(node)) {
                        col1[count+1] = col1[count+1].union(node);
                        col1All = col1All.union(node);
                        probNode = node;
                        
                        console.log('Added to col2');
                        console.log(node.id());
                    }
                }
            });
        }
        count += 1;
        if(stopNext) { cont = false; }
        if(col1All.length + col2All.length == cy.nodes().length) { stopNext = true; }
    }

    if(bipartite) {
        cy.style().selector(col1All).style('background-color', 'red').update();
        cy.style().selector(col2All).style('background-color', 'blue').update();
    } else { 
        // find odd cycle..
        var cycleFound = false;
        
        var start1 = brokenNode;
        var start2 = brokenNodeN;
        var cycle1 = [start1];
        var cycle2 = [start2];
        var stop1  = false;
        var stop2  = false;
        var counter = 0;

        cy.style().selector(start1.neighbourhood().edges().intersect(start2.neighbourhood().edges())).style('line-color', 'red').update();
        console.log('broken edge coloured');
        console.log(start1.id());
        console.log(start2.id());
        
        while(!cycleFound) {
            console.log(counter);
            
            // TO FIX - breaks if there are more than one potential cycles
            if(nextSearch === 1) {
                if(!stop1) {
                    var next1 = cycle1[counter].neighbourhood().intersect(col1All);
                    cycle1.push(next1);
                }
                if(!stop2) {
                    var next2 = cycle2[counter].neighbourhood().intersect(col1All);
                    cycle2.push(next2);
                }
                nextSearch = 2;
            } else if(nextSearch === 2) {
                if(!stop1) {
                    var next1 = cycle1[counter].neighbourhood().intersect(col2All);
                    cycle1.push(next1);
                }
                if(!stop2) {
                    var next2 = cycle2[counter].neighbourhood().intersect(col2All);
                    cycle2.push(next2);
                }
                nextSearch = 1;
            }


            if(!stop1) {
                cy.style().selector(cycle1[cycle1.length-1].neighbourhood().edges().intersect(
                    cycle1[cycle1.length-2].neighbourhood().edges())).style('line-color', 'red').update();
                
                console.log('coloured edge between');
                console.log(cycle1[cycle1.length-1].id());
                console.log(cycle1[cycle1.length-2].id());

                if(cycle1[counter+1] == cy.nodes()[initKey]) {
                    stop1 = true;
                }
            
            }
            if(!stop2) {
                cy.style().selector(cycle2[cycle2.length-1].neighbourhood().edges().intersect(
                    cycle2[cycle2.length-2].neighbourhood().edges())).style('line-color', 'red').update();

                console.log('coloured edge between');
                console.log(cycle2[cycle2.length-1].id());
                console.log(cycle2[cycle2.length-2].id());
                
                if(cycle2[counter+1] == cy.nodes()[initKey]) {
                    stop2 = true;
                }
            }
            
            if(stop1 && stop2) {
                cycleFound = true;
            }

            counter += 1;
            if(counter==15) { cycleFound = true;} 
        }
    }

    return bipartite; 
}


function checkBipartite() {
    var col1 = [];
    var col2 = [];
    key = Object.keys(cy.nodes())[0];
    //var container = cy.collection('nodes');
    //col1 = col1.union(nodes[key]);
    var result = tryColour( key );    
    console.log(result);
}



// Joes Code
let clicks = [];
//let nodes = [false, false, false, false];
let nodeclicks = 0;
let held;
cy.on('click', 'node', function(evt){
    if (held !== true)  {
        clicks.push(evt.target.id());
        edgeCount++;
        if (nodeclicks > 0) {
            cy.add({data: {id: -edgeCount, source: clicks[nodeclicks-1], target: clicks[nodeclicks], selector: edgeCount}});
        }   
        nodeclicks ++;
        if (nodeclicks == 2)  {
            clicks = [];
            nodeclicks =0;
        }
    } else {
        held = false;
    }
});
/*
cy.on('taphold', 'node', function(evt) {
    held = true;
    let nod = evt.target.id();
    let ind = chrs.indexOf(nod);
    chrs.splice(ind, 1);
    console.log(chrs);
    cy.remove(cy.$id(nod));
});
cy.on('click', 'edge', function(evt){
    let ed = evt.target.id();
    cy.remove(cy.$id(ed));
});*/






