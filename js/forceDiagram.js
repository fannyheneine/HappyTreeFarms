

ForceDiagram = function(_parentElement, _data1,_data2){
    this.parentElement = _parentElement;
    this.allData = _data1;
    this.categories_ingredients=_data2;
    this.displayData = []; // see dataForceLayout wrangling

    this.colorScale = d3.scale.category20();
    this.initVis();
};



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

ForceDiagram.prototype.initVis = function(){

    var vis = this;


    vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // 1) INITIALIZE FORCE-LAYOUT

    vis.force=d3.layout.force()
        .size([vis.width, vis.height])
        .charge(10)
        .chargeDistance(500)
        .gravity(0.03);


    //make legend function

    vis.legend = d3.legend.color()
        .scale(vis.colorScale);

    vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(110,200)");


    vis.tip = d3.tip()
        .attr('class', 'd3-tip');


    vis.wrangleData();
};



/*
 * Data wrangling
 */

ForceDiagram.prototype.wrangleData = function(){
    var vis = this;

    // THIS IS WHERE THE FILTERING FUNCTIONS WILL GO
    var filtered=0;
    if (filtered==1){
        vis.allDatafiltered=vis.allData.filter(function(d){return d.Cuisine=="Mexican";})}
    else {
        vis.allDatafiltered=vis.allData;
    }

    //PRE-PROCESSING FOR LINKS-NODES FORMAT
    vis.sampledData=_.sample(vis.allDatafiltered,100);
    vis.jsonData=[];

    vis.sampledData.forEach(function(d,i){
        var dnew={};
        dnew.id= d[""];
        dnew.Country= d.Country;
        dnew.Cuisine= d.Cuisine;
        dnew.Ingredients=[];

        for(var j=1;;j++){
            var ing_i=d["Unnamed: "+j];
            if(ing_i==""){ break;}
            dnew.Ingredients.push(ing_i);

        }

        vis.jsonData.push(dnew);

    });

    var tableByIngredients=[];
    vis.jsonData.forEach(function(d,i){
        d.Ingredients.forEach(function(di,ii){
            if(!(di in tableByIngredients)){
                tableByIngredients[di]=[];
                tableByIngredients[di].push(d.id);
            } else {
                tableByIngredients[di].push(d.id);
            }
        });
    });

    var categoriesByIngredients={};
    for (var category in vis.categories_ingredients) {
        vis.categories_ingredients[category].forEach(function (d, i) {

            categoriesByIngredients[d] = category;
        });
    }

// FOR RECIPES AS NODES
    vis.linksNodesData_Recipes={};
    vis.linksNodesData_Recipes.Nodes=[];
    vis.linksNodesData_Recipes.Links={};

    vis.jsonData.forEach(function(d,i){
        var recipeNode={};
        recipeNode.id= d.id;
        recipeNode.Cuisine= d.Cuisine;
        recipeNode.index=i;
        recipeNode.x=500;
        recipeNode.y=400;
        recipeNode.Ingredients= d.Ingredients;
        vis.linksNodesData_Recipes.Nodes.push(recipeNode);
    });


    var tableByRecipeID ={};
    vis.linksNodesData_Recipes.Nodes.forEach(function(d,i){
        tableByRecipeID[d.id]=d;
    });


    for(var ingredientname in tableByIngredients){
        var ingredient=tableByIngredients[ingredientname];
        ingredient.forEach(function(recipe1id,ii) {
            //create a link btw each recipe with a particular ingredient and every other recipe with that ingredient
            ingredient.forEach(function (recipe2id, jj) {
                if(recipe1id != recipe2id) {
                    var recipe1 = tableByRecipeID[recipe1id];
                    var recipe2 = tableByRecipeID[recipe2id];
                    var linkname = [recipe1id, recipe2id].sort().join('-');


                    if (linkname in vis.linksNodesData_Recipes.Links) {
                        vis.linksNodesData_Recipes.Links[linkname].strength++
                    }
                    else {
                        var linkObject = {};
                        linkObject.source = recipe1.index;
                        linkObject.target = recipe2.index;
                        linkObject.strength = 1;
                        linkObject.name=linkname;
                        vis.linksNodesData_Recipes.Links[linkname] = linkObject;

                    }
                }


            });


        })
    }

    var LinksList=[];
    for (var linkn in vis.linksNodesData_Recipes.Links){
        LinksList.push(vis.linksNodesData_Recipes.Links[linkn]);
    }
    vis.linksNodesData_Recipes.Links=LinksList;

//FOR INGREDIENTS AS NODES
    vis.linksNodesData_Ingredients = {};
    vis.linksNodesData_Ingredients.Nodes = [];
    vis.linksNodesData_Ingredients.Links = {};

    var index_count = 0;
    for (var ingredient in tableByIngredients) {

        var ingredientNode = {};
        ingredientNode.id = ingredient;
        ingredientNode.recipes = tableByIngredients[ingredient];
        ingredientNode.category= categoriesByIngredients[ingredient];
        ingredientNode.index = index_count;
        tableByIngredients[ingredient].index = index_count;
        ingredientNode.x = 500;
        ingredientNode.y = 400;
        vis.linksNodesData_Ingredients.Nodes.push(ingredientNode);
        index_count++
    }

    for (var recipe in tableByRecipeID) {
        var ingredients = tableByRecipeID[recipe].Ingredients;
        ingredients.forEach(function (ing_name1, ii) {
            //create a link btw each ingredient within a particular recipe with every other
            ingredients.forEach(function (ing_name2, jj) {
                if (ing_name1 != ing_name2) {
                    var ing1 = tableByIngredients[ing_name1];
                    var ing2 = tableByIngredients[ing_name2];
                    var linkname = [ing_name1, ing_name2].sort().join('-');


                    if (linkname in vis.linksNodesData_Ingredients.Links) {
                        vis.linksNodesData_Ingredients.Links[linkname].strength++
                    }
                    else {
                        var linkObject = {};
                        linkObject.source = ing1.index;
                        linkObject.target = ing2.index;
                        linkObject.strength = 1;
                        linkObject.name = linkname;
                        vis.linksNodesData_Ingredients.Links[linkname] = linkObject;

                    }
                }


            });


        })
    }

    var LinksList2 = [];
    for (var linkn in vis.linksNodesData_Ingredients.Links) {
        LinksList2.push(vis.linksNodesData_Ingredients.Links[linkn]);
    }
    vis.linksNodesData_Ingredients.Links = LinksList2;


//radio button responsiveness

    vis.selectedVal=d3.select('input[name="graph-type"]:checked').property("value");
    if (vis.selectedVal=="recipe") {
        vis.displayData = vis.linksNodesData_Recipes;
        vis.categoryKeys = _.uniq(vis.displayData.Nodes.map(function (recipe) {
            return recipe.Cuisine;
        }));
    } else if (vis.selectedVal=="ingredient") {
        vis.displayData = vis.linksNodesData_Ingredients;
        vis.categoryKeys = _.uniq(vis.displayData.Nodes.map(function (ingredient) {
            return ingredient.category;
        }));
    }

    vis.colorScale.domain(vis.categoryKeys);


    // Update the visualization
    vis.updateVis();

};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
//
ForceDiagram.prototype.updateVis = function(){

    var vis = this;

    //call the legend
    vis.svg.select(".legend")
        .call(vis.legend);

    //call the tool tip

    vis.tip.html(function(d) {
        if (vis.selectedVal=="recipe"){
            return d.Cuisine;}
        else if (vis.selectedVal=="ingredient") {
            return d.id;
        } });
    vis.svg.call(vis.tip);



    // 2a) DEFINE 'NODES' AND 'EDGES'
    vis.force
        .nodes(vis.displayData.Nodes,function(d){return d.id;})
        .links(vis.displayData.Links,function(d){return d.name;})
        .linkDistance(function(link){return 300/Math.pow(link.strength/2,3);})
        .linkStrength(function(link){return link.strength*.1;});

    // 2b) START RUNNING THE SIMULATION
    vis.force.start();


    // 3) DRAW THE LINKS (SVG LINE) ... or don't?

    vis.link=vis.svg.selectAll(".link")
        .data(vis.displayData.Links,function(d){return d.name;});

    vis.link.exit().remove();

    vis.link.enter().append("line")
        .attr("class","link")
        .attr("stroke","#bbb")
        .attr("stroke-opacity",function(d){return 0.2+ d.strength/10;})
        .attr("stroke-width",function(d){return d.strength/30;});

    // 4) DRAW THE NODES (SVG CIRCLE)
    vis.node = vis.svg.selectAll(".node")
        .data(vis.displayData.Nodes,function(d){return d.id;});

    vis.node.exit().remove();

    vis.node.enter().append("circle")
        .attr("class","node")
        .attr("r",4)
        .attr("fill",function(d,i){
            if (vis.selectedVal=="recipe"){
            return vis.colorScale(d.Cuisine)}
            else if (vis.selectedVal=="ingredient"){
                return vis.colorScale(d.category)
            }
        })
        .on("mouseover",vis.tip.show)
        .on("mouseout",vis.tip.hide)
    ;




    // 5) LISTEN TO THE 'TICK' EVENT AND UPDATE THE X/Y COORDINATES FOR ALL ELEMENTS


    vis.force.on("tick",function(){
        //update node coordinates
        vis.node
            .attr("cx",function(d){ return d.x; })
            .attr("cy",function(d){ return d.y; });

        //update edge coordinates
        vis.link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    });


    vis.node.call(vis.force.drag);



    //
    //// Update domain
    //// Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    //vis.y.domain([0, d3.max(vis.displayData, function(d) {
    //    return d3.max(d.values, function(e) {
    //        return e.y0 + e.y;
    //    });
    //})
    //]);
    //
    //
    //// Draw the layers
    //var categories = vis.svg.selectAll(".area")
    //    .data(vis.displayData);
    //
    //categories.enter().append("path")
    //    .attr("class", "area");
    //
    //categories
    //    .style("fill", function(d) {
    //        return colorScale(d.name);
    //    })
    //    .attr("d", function(d) {
    //        return vis.area(d.values);
    //    });
    //
    //// TO-DO: Update tooltip text
    //categories
    //    .on('mouseover', function(d,i){
    //        vis.textbox.text(d.name); //on mouse over, display labels.  but i'm sorry i can't get the text to wrap
    //    })
    //    .on('mouseout', function(d,i){
    //        vis.textbox.text(""); //on mouse out, remove labels
    //    });
    //
    //categories.exit().remove();
    //
    //
    //// Call axis functions with the new domain
    //vis.svg.select(".x-axis").call(vis.xAxis);
    //vis.svg.select(".y-axis").call(vis.yAxis);
};

