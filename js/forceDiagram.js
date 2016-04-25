

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
        .chargeDistance(50)
        .friction(.05)
        .gravity(.02);


    //make legend function

    vis.legend = d3.legend.color()
        .scale(vis.colorScale);

    vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate("+vis.width*.05+","+vis.height *.3+")");

    vis.rect=vis.svg.append("g")
        .attr("transform", "translate("+vis.width*.85+","+vis.height *.4+")");

    vis.rect.append("rect")
        .attr("width",vis.width *.15)
        .attr("height",vis.height *.20)
        .attr("class","force-textbox")
        .style("fill-opacity",0.2);


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
    vis.sampledData=_.sample(vis.allDatafiltered,150);
    vis.jsonData=[];

    vis.threshold=5;


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
        recipeNode.x=Math.random()*vis.width;
        recipeNode.y=Math.random()*vis.height;
        recipeNode.Ingredients= d.Ingredients;
        vis.linksNodesData_Recipes.Nodes.push(recipeNode);
    });


    vis.linksNodesData_Recipes.Nodes.forEach(function(d1,i1){
        vis.linksNodesData_Recipes.Nodes.forEach(function(d2,i2){
            var recipe1id=d1.id;
            var recipe2id=d2.id;
            if(recipe1id != recipe2id) {
                var linkname = [recipe1id, recipe2id].sort().join('-');

                if (linkname in vis.linksNodesData_Recipes.Links) {
                    //nothing
                } else {
                    var linkObject = {};
                    var ingredients_1 = d1.Ingredients;
                    var ingredients_2 = d2.Ingredients;
                    var commonValues = _.intersection(ingredients_1, ingredients_2);
                    linkObject.source = d1.index;
                    linkObject.target = d2.index;
                    linkObject.sourceid=d1.index;
                    linkObject.targetid=d2.index;
                    linkObject.strength = 13*commonValues.length/((ingredients_1.length + ingredients_2.length)/2);
                    linkObject.name = linkname;
                    linkObject.intersection=commonValues;
                    vis.linksNodesData_Recipes.Links[linkname] = linkObject;
                }
            }
        })

    });



    var LinksList=[];
    for (var linkn in vis.linksNodesData_Recipes.Links){
            LinksList.push(vis.linksNodesData_Recipes.Links[linkn]);

    }
    vis.linksNodesData_Recipes.Links=LinksList;



    var tableByRecipeID ={};
    vis.linksNodesData_Recipes.Nodes.forEach(function(d,i){
        tableByRecipeID[d.id]=d;
    });


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
        ingredientNode.x = Math.random()*vis.width;
        ingredientNode.y = Math.random()*vis.height;
        vis.linksNodesData_Ingredients.Nodes.push(ingredientNode);
        index_count++
    }



    vis.linksNodesData_Ingredients.Nodes.forEach(function(d1,i1){
        vis.linksNodesData_Ingredients.Nodes.forEach(function(d2,i2){
            var ing1id=d1.id;
            var ing2id=d2.id;
            if(ing1id != ing2id) {
                var linkname = [ing1id, ing2id].sort().join('-');

                if (linkname in vis.linksNodesData_Ingredients.Links) {
                    //nothing
                } else {
                    var linkObject = {};
                    var recipes_1 = d1.recipes;
                    var recipes_2 = d2.recipes;
                    var commonValues = _.intersection(recipes_1, recipes_2);
                    linkObject.source = d1.index;
                    linkObject.target = d2.index;
                    linkObject.sourceid=d1.index;
                    linkObject.targetid=d2.index;
                    //normalize interactions by number of recipes
                    linkObject.strength = 25*commonValues.length/((recipes_1.length + recipes_2.length)/2);
                    linkObject.name = linkname;
                    var commonCuisines=[];
                    commonValues.forEach(function(d,i){
                        commonCuisines.push(tableByRecipeID[d].Cuisine);
                    });
                    linkObject.intersection=commonCuisines;
                    vis.linksNodesData_Ingredients.Links[linkname] = linkObject;
                }
            }
        })

    });


    var LinksList2 = [];
    for (var linkn in vis.linksNodesData_Ingredients.Links) {
        LinksList2.push(vis.linksNodesData_Ingredients.Links[linkn]);
    }

    vis.linksNodesData_Ingredients.Links = LinksList2;



    // Update the visualization
    vis.updateVis();

};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
//
ForceDiagram.prototype.updateVis = function() {

    var vis = this;
//radio button responsiveness

    vis.selectedVal = d3.select('input[name="graph-type"]:checked').property("value");
    if (vis.selectedVal == "recipe") {
        vis.displayData = vis.linksNodesData_Recipes;
        vis.categoryKeys = _.uniq(vis.displayData.Nodes.map(function (recipe) {
            return recipe.Cuisine;
        }));
    } else if (vis.selectedVal == "ingredient") {
        vis.displayData = vis.linksNodesData_Ingredients;
        vis.categoryKeys = _.uniq(vis.displayData.Nodes.map(function (ingredient) {
            return ingredient.category;
        }));
    }

    vis.colorScale.domain(vis.categoryKeys);


    //figure out neighboring nodes via links


    vis.nodesLinkedByIndex = {};


    vis.displayData.Links.forEach(function (d) {
        if (d.strength > vis.threshold) {
            vis.nodesLinkedByIndex[d.sourceid + "," + d.targetid] = 1;
            vis.nodesLinkedByIndex[d.targetid + "," + d.sourceid] = 1;
        }
        else {
            vis.nodesLinkedByIndex[d.sourceid + "," + d.targetid] = 0;
            vis.nodesLinkedByIndex[d.targetid + "," + d.sourceid] = 0
        }

    });
    vis.displayData.Nodes.forEach(function (d) {
        vis.nodesLinkedByIndex[d.index + "," + d.index] = 1
    });


    // define neighboring function
    function neighboring(a, b) {
        return vis.nodesLinkedByIndex[a.index + "," + b.index];
    }

    //call the legend
    vis.svg.select(".legend")
        .call(vis.legend);

    //call the tool tip

    vis.tip.html(function (d) {
        if (vis.selectedVal == "recipe") {
            return d.Cuisine;
        }
        else if (vis.selectedVal == "ingredient") {
            return d.id;
        }
    });
    vis.svg.call(vis.tip);


    // 2a) DEFINE 'NODES' AND 'EDGES'
    vis.force
        .nodes(vis.displayData.Nodes, function (d) {
            return d.id;
        })
        .links(vis.displayData.Links, function (d) {
            return d.name;
        })
        .linkDistance(function (link) {
            return 500 / Math.pow((link.strength + 1), 2);
        })
        .linkStrength(function (link) {
            return .4 + .1 * link.strength
        });

    // 2b) START RUNNING THE SIMULATION

        vis.force.start();


        // 3) DRAW THE LINKS (SVG LINE) ... or don't?

        vis.link = vis.svg.selectAll(".link")
            .data(vis.displayData.Links, function (d) {
                return d.name;
            });

        vis.link.exit().remove();

        vis.link.enter().append("line")
            .attr("class", "link")
            .attr("stroke", "#bbb")
            .attr("display", function (d) {
                if (d.strength > vis.threshold) {
                    return "null"
                } else {
                    return "none"
                }
            })
            //assuming max # connections is around 10
            .attr("stroke-opacity", function (d) {
                return (d.strength - (vis.threshold - 1)) / (12 - vis.threshold);
            })
            .attr("stroke-width", function (d) {
                return (d.strength - (vis.threshold - 1)) / (12 - vis.threshold);
            });


        // 4) DRAW THE NODES (SVG CIRCLE)
        vis.node = vis.svg.selectAll(".node")
            .data(vis.displayData.Nodes, function (d) {
                return d.id;
            });

        vis.node.exit().remove();

        //vis.nodeEnter = vis.node.enter().append("g")
        //    .attr("class", "node");

//
//    if (vis.selectedVal == "ingredient") {
//    vis.nodeEnter.append("text")
//        .text(function (d) {
//            if (d.recipes.length > vis.threshold*3) {
//                return d.id;
//            } else {
//                return "";
//            }
//        })
//        .attr("transform", "translate(-15,-5)")
//        .attr("fill", "#000")
//        .attr("class", "ingredients-label");
//}


        vis.node.enter().append("circle")
            .attr("class", "node")
            .attr("r", function (d) {
                return 4;
            })
            .attr("fill", function (d, i) {
                if (vis.selectedVal == "recipe") {
                    return vis.colorScale(d.Cuisine)
                }
                else if (vis.selectedVal == "ingredient") {
                    return vis.colorScale(d.category)
                }
            })
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1)
            .on("mouseover", function (d) {
                d3.select(this).attr("r", 8).style("stroke-width", 2);
                vis.tip.show(d);
                var linktext = [];
                var ind = 0;
                vis.link.style('stroke-opacity', function (l) {
                    if ((d === l.source || d === l.target) && (l.strength > vis.threshold)) {
                        l.intersection.forEach(function (text1, i) {
                            if (linktext.indexOf(text1) == -1) {
                                ind += 1;
                                linktext.push(text1);
                                vis.rect.append("text")
                                    .text(text1)
                                    .attr("y", ind * 15)
                                    .style("fill", "#000")
                                    .attr("class", "force-hover-label");
                            }
                        });
                        return 1;
                    }
                    else
                        return .2;
                });
                vis.link.style('stroke', function (l) {
                    if ((d === l.source || d === l.target) && (l.strength > vis.threshold))
                        return "#000";
                    else
                        return "#bbb";
                });

                vis.node.style("fill-opacity", function (o) {
                    return neighboring(d, o) ? 1 : .02;
                });
                vis.node.attr("r", function (o) {
                    return neighboring(d, o) ? 6 : 4;
                });

            })
            .on("mouseout", function (d) {
                vis.node.attr("r", 4).style("stroke-width", 1);

                vis.rect.selectAll("text").remove();
                vis.tip.hide(d);
                vis.link.style('stroke', "#bbb");
                vis.link.style('stroke-opacity', function (d) {
                    return (d.strength - (vis.threshold - 1)) / (8 - vis.threshold)
                });
                vis.link.style("stroke-width", function (d) {
                    return (d.strength - (vis.threshold - 1)) / (12 - vis.threshold);
                });
                vis.node.style("fill-opacity", 1);

            })
        ;


        // 5) LISTEN TO THE 'TICK' EVENT AND UPDATE THE X/Y COORDINATES FOR ALL ELEMENTS

        vis.force.on("tick", function () {
            //update node coordinates
            vis.node
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });


            //update edge coordinates
            vis.link
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
        });




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

