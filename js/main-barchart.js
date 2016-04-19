// SVG drawing area

var margin = {top: 60, right: 40, bottom: 100, left: 60};

var width = 800 - margin.left - margin.right,
	height = 600 - margin.top - margin.bottom;

var svg = d3.select("#bar-chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom )
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Scales
//var x = d3.time.scale()
//	.range([30, width]);
//
//var y = d3.scale.linear()
//	.range([height, 0]);


// Initialize data
//loadData();

// Ingredients and percentages
var data_i;
var data_p;

//Initialize variables
var yAxis;
var yAxisGroup;
var xAxis;
var xAxisGroup;
var selection = "American"
var line;
var text;
var ingredients = []
var ing_colors = []
var count = 0;

//Intiate scales
var xScale_ing = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1)

var xScale_percentages = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1)


var yScale = d3.scale.linear()
	.range([height,0]);

// Use the Queue.js library to read two files

queue()
	.defer(d3.csv, "data/all_cuisines_percentages.csv")
	.defer(d3.csv, "data/all_cuisines_ing.csv")
	.await(function(error, data_percentages, data_ing) {


		data_percentages.forEach(function (d) {

			// Convert numeric values to 'numbers'
			d.American = +d.American;
			d.Canada = +d.Canada;
			d.Caribbeans = +d.Caribbeans;
			d.China = +d.China;
			d.East_African = +d.East_African;
			d.Eastern_European = +d.Eastern_European;
			d.France = +d.France;
			d.Great_Britain = +d.Great_Britain;
			d.India = +d.India;
			d.Italy = +d.Italy;
			d.Japan = +d.Japan;
			d.Korean = +d.Korean;
			d.Mediterranean = +d.Mediterranean;
			d.Mexican = +d.Mexican;
			d.Middle_East = +d.Middle_East;
			d.North_African = +d.North_African;
			d.Portuguese_Spanish = +d.Portuguese_Spanish;
			d.Scandinavia = +d.Scandinavia;
			d.South_African = +d.South_African;
			d.South_American = +d.South_American;
			d.South_Asian = +d.South_Asian;
			d.Southeast_Asian = +d.Southeast_Asian;
			d.West_African = +d.West_African;
			d.Western_Europeean = +d.Western_Europeean;

		});


		// Store csv data in global variable


		yScale.domain([0, d3.max(data_percentages, function (d) {
			return d[selection]
		})])

		varXdomain = data_ing.map(function (d) {
			return d[selection].replace("_", " ")
		});

		xScale_ing.domain(varXdomain);

		xScale_percentages.domain(d3.range(data_percentages.length));



		ing_colors = colors(varXdomain)

		console.log(ing_colors)
		console.log(ingredients)




		svg.selectAll("rect")
			.data(data_percentages)
			.enter()
			.append("rect")
			.attr("y", function(d) {
				return yScale(d[selection]);
			})
			.attr("height", function(d) {
				return height - yScale(d[selection]);
			})
			.attr("width", 10)
			.attr("x", function(d,i){
				return (1.15*margin.left+xScale_percentages(i))
			})
			.attr("fill", function(d,i){
				return ing_colors[i]
			})




		xAxis = d3.svg.axis()
			.scale(xScale_ing)
			.orient("bottom");

		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left")

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" +margin.left+"," + height + ")")
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-65)" );

		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" +margin.left+",0)")
			.call(yAxis)
			.append("text")
			.attr("y", -15)
			.attr("dy", ".71em")
			.style("text-anchor", "middle")
			.text("% of appearance in recipes");

		data_i = data_ing
		data_p = data_percentages

});

function updateVisualization(data_ing, data_percentages) {

	//We set the domain of the scales
	varXdomain = data_ing.map(function(d) { return d[selection].replace("_", " ") });

	ing_colors = colors(varXdomain)

	console.log(ing_colors)
	console.log(ingredients)

	yScale.domain([0, d3.max(data_percentages, function(d) { return d[selection] })])
	xScale_ing.domain(varXdomain)

	svg.select(".x")
		.transition()
		.duration(800)
		.call(xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-65)" );
		//.attr("transform", "rotate(-65)" );

	svg.select(".y")
		.transition()
		.duration(800)
		.call(yAxis);

	var rect = svg.selectAll("rect")
		.data(data_percentages)
		.transition()
		.duration(800)
		.attr("fill", function(d,i){
			return ing_colors[i]
		})

	//rect.enter()
		//.append("rect")



	rect
		.transition()
		.duration(800)
		.attr("y", function(d) {
			return yScale(d[selection]);
		})
		.attr("height", function(d) {
			return height - yScale(d[selection]);
		})
		.attr("width", 10)
		.attr("x", function(d,i){
			return (1.15*margin.left+xScale_percentages(i))
		});



	//rect.exit()
	//	.transition()
	//	.duration(800)
	//	.remove();


}


//We set the function for the "chart-data"
d3.select("#ranking-type").on("change", function(){
	selection = d3.select("#ranking-type").property("value");

	//d3.select("#details").style("visibility", "hidden"); //We hide the information of the previously selected tournament
	//d3.select("#ylabel").remove(); //We remove the ylabel
	updateVisualization(data_i, data_p);


});

function colors(varXdomain) {

	var ing_colors = []

	varXdomain.forEach(function (d) {
		if (ingredients.indexOf(d)===-1) {
			ingredients.push(d)
			ing_colors.push(colorbrewer.Set4[12][count])
			count = count + 1;


		} else {
			idx = ingredients.indexOf(d)
			ing_colors.push(colorbrewer.Set4[12][idx])
		}

	});
	return ing_colors
}