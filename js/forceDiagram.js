

ForceDiagram = function(_parentElement, _data1,_data2,_svgWidth,_nDataPoints){
    this.parentElement = _parentElement;
    this.allData = _data1;
    this.categories_ingredients=_data2;
    this.displayData = []; // see dataForceLayout wrangling
    this.svgWidth=_svgWidth;
    this.colorScale = d3.scale.category20();
    this.nDataPoints=_nDataPoints;
    this.initVis();
};



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

ForceDiagram.prototype.initVis = function(){

    var vis = this;

    vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };


    //LEGEND WILL DISAPPEAR FOR VIS.WIDTH < 500 px
    vis.svgHeight=vis.svgWidth*.6;
    vis.width = vis.svgWidth - vis.margin.left - vis.margin.right;
    vis.height = vis.svgHeight - vis.margin.top - vis.margin.bottom;

    vis.nodeRadius_normal=vis.width/230;
    vis.nodeRadius_highlight=vis.width/180;
    vis.nodeRadius_selected=vis.width/130;

    vis.nodeStrokeWidth=1;
    vis.nodeStrokeWidthActive=2;
    // SVG drawing area
    vis.svgEl = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    vis.svg = vis.svgEl
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
        .attr("transform", "translate("+vis.width*.01+","+vis.height *.2+")");


    //
    //vis.rect.append("rect")
    //    .attr("width",vis.width *.15)
    //    .attr("height",vis.height *.20)
    //    .attr("class","force-textbox")
    //    .style("fill-opacity",0.2);


    vis.tip = d3.tip()
        .attr('class', 'd3-tip');



    vis.wrangleData("all");
};



/*
 * Data wrangling
 */

ForceDiagram.prototype.wrangleData = function(filters){
    var vis = this;

    vis.filters=filters;
    // THIS IS WHERE THE FILTERING FUNCTIONS WILL GO
    if (filters=="all"){
        vis.allDatafiltered=vis.allData;

    } else {
        for( var type in vis.filters) {
            if (type=="Cuisine"){
                vis.allDatafiltered=vis.allData.filter(function(d){return d.Cuisine==vis.filters[type];})
            }
        }
    }


    //PRE-PROCESSING FOR LINKS-NODES FORMAT
    vis.sampledData=_.sample(vis.allDatafiltered,vis.nDataPoints);
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

    var LinkStrengths=[];
    LinksList.forEach(function(d){LinkStrengths.push(d.strength);});
    var sum = LinkStrengths.reduce(function (a, b) {
        return a + b;
    }, 0);

    var average=sum/LinkStrengths.length;
    console.log(average)
    vis.threshold=3.5*average;



    vis.tableByRecipeID ={};
    vis.linksNodesData_Recipes.Nodes.forEach(function(d,i){
        vis.tableByRecipeID[d.id]=d;
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
                        commonCuisines.push(vis.tableByRecipeID[d].Cuisine);
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

    if (!vis.textToolTipFreeze){}
    else {vis.textToolTipFreeze.remove()}
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
    if (vis.width < 500) {}
    else{
    vis.svg.select(".legend")
        .call(vis.legend);
    }

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
            return (vis.width/2)/ Math.pow((link.strength + 1), 2);
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
            .style("stroke", "#bbb")
            .attr("display", function (d) {
                if (d.strength > vis.threshold) {
                    return "null"
                } else {
                    return "none"
                }
            })
            //assuming max # connections is around 10
            .style("stroke-opacity", function (d) {
                return (d.strength - (vis.threshold - 1)) / (12 - vis.threshold);
            })
            .style("stroke-width", function (d) {
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

    vis.rect=vis.svg.append("g");

    vis.toggleNode=0;
    vis.selectedNode;



    vis.svgEl.on("click",function(d){
        if (vis.toggleNode){
            vis.toggleNode=0;
            clearAllFunction();
            vis.tip.hide(vis.selectedNode);
            vis.textToolTipFreeze.remove();
        }
    });
        vis.node.enter().append("circle")
            .attr("class", "node")
            .attr("r", function (d) {
                return vis.nodeRadius_normal;
            })
            .attr("fill", function (d, i) {
                if (vis.selectedVal == "recipe") {
                    return vis.colorScale(d.Cuisine)
                }
                else if (vis.selectedVal == "ingredient") {
                    return vis.colorScale(d.category)
                }
            })
            .style("stroke", "#ccc")
            .style("stroke-width", vis.nodeStrokeWidth)
            .on("mouseover", function(d){
                var thisVar=d3.select(this);
                mouseOverFunction(d,thisVar)
            })
            .on("mouseout", function(d){
                var thisVar=d3.select(this);
                mouseOutFunction(d,thisVar)
            })
            .on("click",function(d){
                var thisVar=d3.select(this);
                if (!vis.toggleNode) {
                    mouseOutFunction(d,thisVar);
                    mouseOverFunction(d, thisVar);
                    vis.textToolTipFreeze = vis.svg.append("text").style("fill", "#000")
                        .attr("class", "force-tooltip-freeze-label")
                        .attr("x", d.x+8)
                        .attr("y", d.y-8)
                        .attr("font-size",18);
                    if (vis.selectedVal == "recipe") {
                        vis.textToolTipFreeze.text(d.Cuisine);
                    }
                    else if (vis.selectedVal == "ingredient") {
                        vis.textToolTipFreeze.text(d.id);
                    }
                    vis.toggleNode = 1;
                    vis.selectedNode = d;

                    setIfDifferent_att(thisVar, d, 'r', vis.nodeRadius_selected);
                    setIfDifferent(thisVar, d, 'stroke-width', vis.nodeStrokeWidthActive);
                    vis.tip.hide(d);
                    d3.event.stopPropagation();
                }

            })
        ;


    function mouseOutFunction(d,thisvar) {
        vis.rect.selectAll("text").remove();
        vis.rect.selectAll("rect").remove();
        if (!vis.toggleNode) {
            clearAllFunction();
            vis.tip.hide(d);

        } else if (vis.toggleNode) {
            if (d === vis.selectedNode) {
                vis.tip.hide(d);
            } else {
                var n = thisvar;
                setIfDifferent_att(n, d, 'r', vis.nodeRadius_normal);
                setIfDifferent(n, d, 'stroke-width', vis.nodeStrokeWidth);
                vis.tip.hide(d);


            }
        }

    }

    function clearAllFunction() {
        vis.node.each(function (dd) {
            var n = d3.select(this);
            setIfDifferent(n, dd, 'fill-opacity', 1);
            setIfDifferent(n, dd, 'stroke', "#ccc");
            setIfDifferent(n, dd, 'stroke-width', vis.nodeStrokeWidth);
            setIfDifferent_att(n, dd, 'r', vis.nodeRadius_normal);
        });
        vis.link.each(function(l) {
            var el = d3.select(this);
            setIfDifferent(el, l, 'stroke', "#bbb");
            var strokeOpacity = (l.strength - (vis.threshold - 1)) / (8 - vis.threshold);
            setIfDifferent(el, l, 'stroke-opacity', strokeOpacity);
        });
    }

    function mouseOverFunction(d,thisvar) {
        if (!vis.toggleNode){
            vis.tip.show(d);
            setIfDifferent_att(thisvar, d, 'r', vis.nodeRadius_highlight);
            setIfDifferent(thisvar, d, 'stroke-width', vis.nodeStrokeWidthActive);


            vis.link.each(function(l) {
            var el = d3.select(this);

            var strokeColor="#bbb";
            var strokeOpacity=.2;
            var strokeWidth;

            if ((d === l.source || d === l.target) && (l.strength > vis.threshold)){
                strokeColor = "#000";
                strokeOpacity = 1;

                setIfDifferent(el, l, 'stroke', strokeColor);
                setIfDifferent(el, l, 'stroke-opacity', strokeOpacity);
            }
                else {
                setIfDifferent(el, l, 'stroke', strokeColor);
                setIfDifferent(el, l, 'stroke-opacity', strokeOpacity);}
        }
        )
        ;


            vis.node.each(function(dd){
                var n=d3.select(this);
                var fillOpacity=.08;
                var strokeColor="#ccc";
                var strokeOpacity=.5;
                if (neighboring(d,dd)) {
                    fillOpacity=1;
                    strokeColor="#777";
                    strokeOpacity=1;
                }
                setIfDifferent(n, dd, 'fill-opacity', fillOpacity);
                setIfDifferent(n, dd, 'stroke', strokeColor);
                setIfDifferent(n, dd, 'stroke-opacity', strokeOpacity);


            });

            if (vis.selectedVal == "recipe"){
                printIngredients(d);}
            else if (vis.selectedVal == "ingredient"){
                printRecipes(d)
            }

    }
    else if (vis.toggleNode==1){
            if (d===vis.selectedNode){
                setIfDifferent_att(thisvar, d, 'r', vis.nodeRadius_selected);
                setIfDifferent(thisvar, d, 'stroke-width', vis.nodeStrokeWidthActive);

                if (vis.selectedVal == "recipe"){
                    printIngredients(d);}
                else if (vis.selectedVal == "ingredient"){
                    printRecipes(d)
                }


            }
            else if (neighboring(d,vis.selectedNode)) {
                vis.tip.show(d);
                setIfDifferent_att(thisvar, d, 'r', vis.nodeRadius_highlight);
                setIfDifferent(thisvar, d, 'stroke-width', vis.nodeStrokeWidthActive);

                if (vis.selectedVal == "recipe"){
                    printIngredients(d);}
                else if (vis.selectedVal == "ingredient"){
                    printRecipes(d)
                }


                vis.rect.append("text")
                    .attr("class","force-hover-label-title")
                    .attr("y",-30)
                    .attr("x",145)
                    .text("Intersection:")
                    .attr("fill","#777");
                vis.link.each(function(l)
                {var el = d3.select(this);
                    if (((d === l.source && vis.selectedNode=== l.target) || (d === l.target && vis.selectedNode=== l.source)) && (l.strength > vis.threshold)){
                        l.intersection.forEach(function (text1, i) {
                            vis.rect.append("rect")
                                .attr("class","force-hover-label-rectangle")
                                .attr("x",150)
                                .attr("y",i*25-15)
                                .attr("rx",7)
                                .attr("ry",7)
                                .attr("width",140)
                                .attr("height",20);
                            vis.rect.append("text")
                                .text(text1)
                                .attr("x",155)
                                .attr("y", i* 25)
                                .style("fill", "#000")
                                .attr("class", "force-hover-label");
                        });

                    }

                });
            }

        }
    }

    function printIngredients(d){
        var trans_x= d.x+70;
        var trans_y= d.y-40;
        vis.rectmoved=vis.rect.attr("transform", "translate("+ trans_x +","+trans_y+")");
        vis.rectmoved.append("text")
            .attr("class","force-hover-label-title")
            .attr("y",-30)
            .attr("x",-10)
            .text("Ingredients:")
            .attr("fill","#777");
        d.Ingredients.forEach(function (text1, i) {
            vis.rectmoved.append("rect")
                .attr("class","force-hover-label-rectangle")
                .attr("x",-5)
                .attr("y",i*25-15)
                .attr("rx",7)
                .attr("ry",7)
                .attr("width",140)
                .attr("height",20);
            vis.rectmoved.append("text")
                .text(text1)
                .attr("y", i* 25)
                .style("fill", "#000")
                .attr("class", "force-hover-label");

        });
    }

    function printRecipes(d){
        var trans_x= d.x+70;
        var trans_y= d.y-40;
        vis.rectmoved=vis.rect.attr("transform", "translate("+ trans_x +","+trans_y+")");
        vis.rectmoved.append("text")
            .attr("class","force-hover-label-title")
            .attr("y",-30)
            .attr("x",-10)
            .text("Cuisines:")
            .attr("fill","#777");

        var Cuisines=[];
        d.recipes.forEach(function(d,i){
            Cuisines.push(vis.tableByRecipeID[d].Cuisine);
        });
        var uniqueCuisines = Cuisines.filter(function(item, pos) {
            return Cuisines.indexOf(item) == pos;
        });

        uniqueCuisines.forEach(function (text1, i) {
            vis.rectmoved.append("rect")
                .attr("class","force-hover-label-rectangle")
                .attr("x",-5)
                .attr("y",i*25-15)
                .attr("rx",7)
                .attr("ry",7)
                .attr("width",140)
                .attr("height",20);
            vis.rectmoved.append("text")
                .text(text1)
                .attr("y", i* 25)
                .style("fill", "#000")
                .attr("class", "force-hover-label");

        });
    }

    function setIfDifferent(el, d, attName, value)
    {
        if(!d[attName] || value != d[attName])
        {
            //console.log(el);
            //console.log('not saving time right now', attName, d[attName] , value, !d[attName] || value != d[attName], value != d[attName] );
            el.style(attName, value);
            d[attName] = value;

        }

    }

    function setIfDifferent_att(el, d, attName, value)
    {
        if(!d[attName] || value !== d[attName])
        {
            //console.log(el);
            el.attr(attName, value);
            d[attName] = value;
        }
    }


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

    //STOP FORCE LAYOUT AFTER 10 SECONDS
    window.setTimeout(function()
    {
        vis.force.stop();
    }, 10000);

    //IF WE NEED A CLICK RECTANGLE FOR THE MINI VERSION

    //if (vis.width < 500) {
    //    vis.clickRectangle=vis.svgEl.append("rect")
    //        .attr("width",vis.svgWidth)
    //        .attr("height",vis.svgHeight)
    //        .attr("fill","#ccc")
    //        .on("click",function(){
    //
    //        });
    //}


};

