

ForceDiagram = function(_parentElement, _data1, _data2){
    this.parentElement = _parentElement;
    this.data_recipes = _data1;
    this.data_ingredients = _data2;
    this.displayData = []; // see dataForceLayout wrangling


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
        .scale(colorScale);

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

    vis.selectedVal=d3.select('input[name="graph-type"]:checked').property("value");
    if (vis.selectedVal=="recipe") {
        vis.displayData = vis.data_recipes;
        vis.categoryKeys = _.uniq(vis.displayData.Nodes.map(function (recipe) {
            return recipe.Cuisine;
        }));
    } else if (vis.selectedVal=="ingredient") {
        vis.displayData = vis.data_ingredients;
        vis.categoryKeys = _.uniq(vis.displayData.Nodes.map(function (ingredient) {
            return ingredient.category;
        }));
    }

    colorScale.domain(vis.categoryKeys);


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
            return "Recipe ID:"+d.id;}
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
            return colorScale(d.Cuisine)}
            else if (vis.selectedVal=="ingredient"){
                return colorScale(d.category)
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

