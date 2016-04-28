
// Will be used to the save the loaded JSON dataForceLayout
var allData = [];
var categories_ingredients={};


// Variables for the visualization instances
var forceplot
var forceplot2


// Start application by loading the dataForceLayout
//loadData();
//loadDataRunOnce();
//
//queue().defer(d3.json,"data/dataNodesLinks_Ingredients.json")
//    .defer(d3.json,"data/dataNodesLinks_Recipes.json")
//    .await(createVis);
//
queue().defer(d3.csv,"data/recipes_sampled.csv")
    .defer(d3.json,"data/categories.json")
    .await(createVis);

function createVis(error,data1,data2) {
    // Create an object instance
    allData=data1;
    categories_ingredients=data2;
    //console.log(data_ingredients)
    forceplot2 = new ForceDiagram("force-layout2", allData,categories_ingredients,200,"Force2");
    forceplot = new ForceDiagram("force-layout", allData,categories_ingredients,500,"Force1");
}



//function createVis(error,data1,data2) {
//    // Create an object instance
//    allData=data1;
//    categories_ingredients=data2;
//    //console.log(data_ingredients)
//    forceplot2 = new ForceDiagram("force-layout2", allData,categories_ingredients,300,"Force2");
//}



//function brushed() {
//
//    // Set new domain if brush (user selection) is not empty
//    areachart.x.domain(
//        timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent()
//    );
//
//    // Update focus chart (detailed information)
//
//    areachart.wrangleData();
//
//}
