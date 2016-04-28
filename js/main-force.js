
// Will be used to the save the loaded JSON dataForceLayout
var allData = [];
var categories_ingredients={};




// Variables for the visualization instances
var forceplot;
var forceplot_mini;



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
    forceplot = new ForceDiagram("force-layout", allData,categories_ingredients,1200,150);
    //forceplot_mini= new ForceDiagram("force-layout-mini", allData,categories_ingredients,300,10);
}




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
