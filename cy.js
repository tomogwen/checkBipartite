var cy;
var nodeCount;
var edgeCount;
var col1All;
var col2All;

function init() {

    // initialise cytoscape
    cy = cytoscape({

      container: document.getElementById('cy'), // container to render in

      elements: [ // list of graph elements to start with
          /*{ // node a
                  data: { id: '1' }
            },
            { // node b
                  data: { id: '2' }
            },
            { // node b
                  data: { id: '3' }
            },
            { // node b
                  data: { id: '4' }
            },
            { // node b
                  data: { id: '5' }
            },

            { // edge ab
                  data: { id: 'a1b', source: '5', target: '1' }
            },
            { // edge ab
                  data: { id: 'ab', source: '1', target: '2' }
            },
            { // edge ab
                  data: { id: 'a2b', source: '2', target: '3' }
            },
            { // edge ab
                  data: { id: 'a12b', source: '3', target: '4' }
            },
            { // edge ab
                  data: { id: 'a21321', source: '4', target: '5' }
            } */
        ],
      style: [ // the stylesheet for the graph
          {
                selector: 'node',
                style: {
                        'background-color': '#002b80',
                        //'label': 'data(id)'
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

    /*let clicks = [];
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
    */

    var sortBut = document.getElementById('dispBut');
    sortBut.style.display = 'none';

}

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
    // runs COSE, an algo to make it look pretty
    var options = {
        name: 'cose',
        animate: 'true'
    };
    var layout = cy.layout(options);
    layout.run();

}


/*function binomial(n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number')) 
        return false; 
    
    var coeff = 1;
    for (var x = n-k+1; x <= n; x++) 
        coeff *= x;
    for (x = 1; x <= k; x++) 
        coeff /= x;
    
    return coeff;
}*/


function randomEdges(numNodes) {
    // adds random edges to available nodes
    // please note, works sequentially, so breaks if non-sequential IDs
    for (var i = 0; i< Math.floor(1*(numNodes-1)); i++) {
        var startId = Math.floor(Math.random() * numNodes); 
        var endId = startId;
        while (endId === startId) {
            endId   = Math.floor(Math.random() * numNodes);
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


function randomNodes(numNodes) { 
    for (var i = 0; i<numNodes; i++) {
        cy.add({
            group: 'nodes',
            //data: { id: nodeCount},
            data: {id: i},
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
    col1All = cy.collection();
    col2All = cy.collection();
    var col1 = [];
    var col2 = [];

    col1.push(cy.collection());
    col1[0] = col1[0].union(cy.nodes()[initKey]);
    col1All = col1All.union(cy.nodes()[initKey]);

    var probNode;
    var bipartite = true;
    var count = 0;
    var nextSearch = 1;
    
    var prev = {};
    var prevId = {};
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

                        prev[node.id()] = col1[count][i];
                        prevId[node.id()] = col1[count][i].id();    

                        console.log('Added to col2');
                        console.log(node.id());
                        console.log('with prev node');
                        console.log(col1[count][i].id());
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
                        
                        prev[node.id()] = col2[count][i];
                        prevId[node.id()] = col2[count][i].id();
                        console.log('Added to col2');
                        console.log(node.id());
                        console.log('with prev node');
                        console.log(col2[count][i].id());
                    }
                }
            });
        }
        count += 1;
        if(stopNext) { cont = false; }
        if(col1All.length + col2All.length == cy.nodes().length) { stopNext = true; }
        if(count == 500 ) { alert('error'); cont = false;} 
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
        // var stop1  = false;
        // var stop2  = false;
        var counter = 0;


        console.log('prev');
        console.table(prevId);
        cy.style().selector(start1.neighbourhood().edges().intersect(start2.neighbourhood().edges())).style('line-color', 'red').update();
        console.log('broken edge coloured');
        console.log(start1.id());
        console.log(start2.id());
        
        while(!cycleFound) {

            var next1 = prev[cycle1[cycle1.length-1].id()];
            cycle1.push(next1);
            
            var next2 = prev[cycle2[cycle2.length-1].id()];
            cycle2.push(next2);
    
            console.log('next 1/2');
            console.log(next1.id());
            console.log(next2.id());

            cy.style().selector(cycle1[cycle1.length-1].neighbourhood().edges().intersect(
                cycle1[cycle1.length-2].neighbourhood().edges())).style('line-color', 'red').update();
            console.log('coloured edge between');
            console.log(cycle1[cycle1.length-1].id());
            console.log(cycle1[cycle1.length-2].id());

            cy.style().selector(cycle2[cycle2.length-1].neighbourhood().edges().intersect(
                cycle2[cycle2.length-2].neighbourhood().edges())).style('line-color', 'red').update();
            console.log('coloured edge between');
            console.log(cycle2[cycle2.length-1].id());
            console.log(cycle2[cycle2.length-2].id());

            if( next1 == next2 ) {
                cycleFound = true;
            }
            if(counter==15) { cycleFound = true;}
            counter+=1;

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
    
    // tryColour ONLY WORKS ON CONNECTED GRAPHS
    var result = tryColour( key );    
    console.log(result);

    if(result) {
        var sortBut = document.getElementById('dispBut');
        sortBut.style.display = 'block';
    }

}


function deleteComponents() {
    var col  = cy.elements();
    var comp = col.components();

    var bestLen = 0;
    var bestInd = 0;
    for(var i=0; i<comp.length; i++){
        if(comp.length > bestLen) { 
            bestLen = comp.length;
            bestInd = i;
        }
    }
    for(var i=0; i<comp.length; i++){
        if( i!== bestInd) {
            cy.remove(comp[i]);
        }
    }
}


function genGraph() {

    var nodeCount = 0;
    var edgeCount = 0;
    var numNodes = 10;
    
    init();
    console.clear();
    randomNodes(numNodes);
    randomEdges(numNodes);
    deleteIsolated();
    deleteComponents();
    
    var options = {
        name: 'cose',
        animate: 'false'
    };
    var layout = cy.layout(options);
    layout.run();

}


function moveToColours() {

    for(var i=0; i<col1All.length; i++) {
        col1All[i].position('x','10');
        col1All[i].position('y',10+i*60);
    }   

    for(var i=0; i<col2All.length; i++) {
        col2All[i].position('x', '100');
        col2All[i].position('y', 10+i*60);
    }
    cy.fit(col1All.union(col2All), 100);
}


