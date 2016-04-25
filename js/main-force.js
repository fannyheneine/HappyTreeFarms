
// Will be used to the save the loaded JSON dataForceLayout
var allData = [];
var categories_ingredients={};
var data_recipes;
var data_ingredients;



// Variables for the visualization instances
var forceplot;




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
//
//
//
////NOTE: THIS FUNCTION IS ONLY RUN WHEN DATA NEEDS TO BE CONVERTED FROM RECIPE FORMAT TO LINKS/NODES JSON
////FORCE LAYOUT FORMAT.  I don't recommend running it each time the page loads...
//function loadDataRunOnce() {
//	d3.csv("data/recipes_sampled.csv", function(error, fullData){
//        //this function is for creating recipes as nodes
//		if(!error){
//            console.log('gothere')
//			allData = fullData;
//            var filtered=1;
//            if (filtered==1){
//            allDatafiltered=allData.filter(function(d){return d.Cuisine=="Mexican";})}
//            else {
//                allDatafiltered=allData;
//            }
//
//            var sampledData1000=_.sample(allDatafiltered,200);
//            var jsonData=[];
//
//            sampledData1000.forEach(function(d,i){
//                var dnew={};
//                dnew.id= d[""];
//                dnew.Country= d.Country;
//                dnew.Cuisine= d.Cuisine;
//                dnew.Ingredients=[];
//
//                for(var j=1;;j++){
//                    var ing_i=d["Unnamed: "+j];
//                    if(ing_i==""){ break;}
//                    dnew.Ingredients.push(ing_i);
//
//                }
//
//                jsonData.push(dnew);
//
//            });
//            console.log('gothere')
//
//            var tableByIngredients=[];
//            jsonData.forEach(function(d,i){
//                d.Ingredients.forEach(function(di,ii){
//                    if(!(di in tableByIngredients)){
//                        tableByIngredients[di]=[];
//                        tableByIngredients[di].push(d.id);
//                    } else {
//                        tableByIngredients[di].push(d.id);
//                    }
//                });
//            });
//
//
//            var linksNodesData={};
//            linksNodesData.Nodes=[];
//            linksNodesData.Links={};
//
//            jsonData.forEach(function(d,i){
//                var recipeNode={};
//                recipeNode.id= d.id;
//                recipeNode.Cuisine= d.Cuisine;
//                recipeNode.index=i;
//                recipeNode.x=500;
//                recipeNode.y=400;
//                linksNodesData.Nodes.push(recipeNode);
//            });
//
//            var tableByRecipeID ={};
//            linksNodesData.Nodes.forEach(function(d,i){
//                tableByRecipeID[d.id]=d;
//            });
//
//            for(var ingredientname in tableByIngredients){
//                var ingredient=tableByIngredients[ingredientname];
//                ingredient.forEach(function(recipe1id,ii) {
//                    //create a link btw each recipe with a particular ingredient and every other recipe with that ingredient
//                    ingredient.forEach(function (recipe2id, jj) {
//                        if(recipe1id != recipe2id) {
//                            var recipe1 = tableByRecipeID[recipe1id];
//                            var recipe2 = tableByRecipeID[recipe2id];
//                            var linkname = [recipe1id, recipe2id].sort().join('-');
//
//
//                            if (linkname in linksNodesData.Links) {
//                                linksNodesData.Links[linkname].strength++
//                            }
//                            else {
//                                var linkObject = {};
//                                linkObject.source = recipe1.index;
//                                linkObject.target = recipe2.index;
//                                linkObject.strength = 1;
//                                linkObject.name=linkname;
//                                linksNodesData.Links[linkname] = linkObject;
//
//                            }
//                        }
//
//
//                    });
//
//
//                })
//            }
//
//            var LinksList=[];
//            for (var linkn in linksNodesData.Links){
//                LinksList.push(linksNodesData.Links[linkn]);
//            }
//            linksNodesData.Links=LinksList;
//
//
//            var textFile = null,
//                makeTextFile = function (text) {
//                    var data = new Blob([text], {type: 'text/plain'});
//
//
//                    if (textFile !== null) {
//                        window.URL.revokeObjectURL(textFile);
//                    }
//
//                    textFile = window.URL.createObjectURL(data);
//
//                    // returns a URL you can use as a href
//                    return textFile;
//                };
//            var link = document.getElementById('download');
//            link.href = makeTextFile(JSON.stringify(jsonData));
//            link.style.display = 'block';
//
//            console.log('finished')
//		}
//	});
//}
//
//
////NOTE: THIS FUNCTION IS ONLY RUN WHEN DATA NEEDS TO BE CONVERTED FROM RECIPE FORMAT TO LINKS/NODES JSON
////FORCE LAYOUT FORMAT.  I don't recommend running it each time the page loads...
//function loadDataRunOnce2() {
//    //this function is for creating ingredients as nodes
//    d3.csv("data/recipes_sampled.csv", function (error, fullData) {
//        if (!error) {
//
//            d3.json("data/categories.json", function (error, jsonImport) {
//                if (!error) {
//
//                    allData = fullData;
//                    categories_ingredients = jsonImport;
//
//
//
//                    var sampledData1000 = _.sample(allData, 100);
//                    var jsonData = [];
//
//                    sampledData1000.forEach(function (d, i) {
//                        var dnew = {};
//                        dnew.id = d[""];
//                        dnew.Country = d.Country;
//                        dnew.Cuisine = d.Cuisine;
//                        dnew.Ingredients = [];
//
//                        for (var j = 1; ; j++) {
//                            var ing_i = d["Unnamed: " + j];
//                            if (ing_i == "") {
//                                break;
//                            }
//                            dnew.Ingredients.push(ing_i);
//
//                        }
//
//                        jsonData.push(dnew);
//
//                    });
//
//                    var tableByIngredients = [];
//                    jsonData.forEach(function (d, i) {
//                        d.Ingredients.forEach(function (di, ii) {
//                            if (!(di in tableByIngredients)) {
//                                tableByIngredients[di] = [];
//                                tableByIngredients[di].push(d.id);
//                            } else {
//                                tableByIngredients[di].push(d.id);
//                            }
//                        });
//                    });
//
//                    var categoriesByIngredients={};
//                    for (var category in categories_ingredients) {
//                        categories_ingredients[category].forEach(function (d, i) {
//
//                            categoriesByIngredients[d] = category;
//
//
//                        });
//                    }
//
//
//
//                    var linksNodesData = {};
//                    linksNodesData_Ingredients.Nodes = [];
//                    linksNodesData_Ingredients.Links = {};
//
//                    var index_count = 0;
//                    for (var ingredient in tableByIngredients) {
//
//                        var ingredientNode = {};
//                        ingredientNode.id = ingredient;
//                        ingredientNode.recipes = tableByIngredients[ingredient];
//                        ingredientNode.category= categoriesByIngredients[ingredient];
//                        ingredientNode.index = index_count;
//                        tableByIngredients[ingredient].index = index_count;
//                        ingredientNode.x = 500;
//                        ingredientNode.y = 400;
//                        linksNodesData_Ingredients.Nodes.push(ingredientNode);
//                        index_count++
//                    }
//
//
//                    var tableByRecipeID = {};
//                    jsonData.forEach(function (d, i) {
//                        tableByRecipeID[d.id] = d;
//                    });
//
//                    for (var recipe in tableByRecipeID) {
//                        var ingredients = tableByRecipeID[recipe].Ingredients;
//                        ingredients.forEach(function (ing_name1, ii) {
//                            //create a link btw each ingredient within a particular recipe with every other
//                            ingredients.forEach(function (ing_name2, jj) {
//                                if (ing_name1 != ing_name2) {
//                                    var ing1 = tableByIngredients[ing_name1];
//                                    var ing2 = tableByIngredients[ing_name2];
//                                    var linkname = [ing_name1, ing_name2].sort().join('-');
//
//
//                                    if (linkname in linksNodesData_Ingredients.Links) {
//                                        linksNodesData_Ingredients.Links[linkname].strength++
//                                    }
//                                    else {
//                                        var linkObject = {};
//                                        linkObject.source = ing1.index;
//                                        linkObject.target = ing2.index;
//                                        linkObject.strength = 1;
//                                        linkObject.name = linkname;
//                                        linksNodesData_Ingredients.Links[linkname] = linkObject;
//
//                                    }
//                                }
//
//
//                            });
//
//
//                        })
//                    }
//
//                    var LinksList = [];
//                    for (var linkn in linksNodesData_Ingredients.Links) {
//                        LinksList.push(linksNodesData_Ingredients.Links[linkn]);
//                    }
//                    linksNodesData_Ingredients.Links = LinksList;
//
//                    var textFile = null,
//                        makeTextFile = function (text) {
//                            var data = new Blob([text], {type: 'text/plain'});
//
//                            // If we are replacing a previously generated file we need to
//                            // manually revoke the object URL to avoid memory leaks.
//                            if (textFile !== null) {
//                                window.URL.revokeObjectURL(textFile);
//                            }
//
//                            textFile = window.URL.createObjectURL(data);
//
//                            // returns a URL you can use as a href
//                            return textFile;
//                        };
//                    var link = document.getElementById('download');
//                    link.href = makeTextFile(JSON.stringify(linksNodesData_Recipes));
//                    link.style.display = 'block';
//                    console.log(linksNodesData_Recipes)
//                    console.log('finished')
//
//                }
//            })
//        }
//    })
//}



function createVis(error,data1,data2) {
    // Create an object instance
    allData=data1;
    categories_ingredients=data2;
    //console.log(data_ingredients)


    forceplot = new ForceDiagram("force-layout", allData,categories_ingredients);

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
