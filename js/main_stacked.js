
// Will be used to the save the loaded JSON data
var allData_big = [];
var allData=[];
// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

// Set ordinal color scale
var colorScale = d3.scale.category20();

// Variables for the visualization instances
var areachart, timeline;
var filtered = false;
var country_chosen="Lebanon";

// Start application by loading the data
loadData_stacked(country_chosen);

function loadData_stacked(country_chosen) {
	d3.json("data/All_countries.json", function(error, jsonData){
		if(!error){
			allData_big = jsonData;

			// Select Appropriate country
			console.log(allData_big[0])

			for (i = 0; i < allData_big.length; i++){
				if (allData_big[i].country == country_chosen) {
					allData = allData_big[i];
				}
			}
			//allData=allData_big.country_chosen;
			//console.log(allData_big.country_chosen)

			// Convert years to date objects
			allData.layers.forEach(function(d){
				for (var column in d) {
	        if(d.hasOwnProperty(column) && column == "Year") {
	        	d[column] = parseDate(d[column].toString());
	        }
	      }
			});

			allData.years.forEach(function(d){
				d.Year = parseDate(d.Year.toString());
			});

			// Update color scale (all column headers except "Year")
			// We will use the color scale later for the stacked area chart
			colorScale.domain(d3.keys(allData.layers[0]).filter(function(d){ return d != "Year"; }))

			createVis_stacked();
		}
	});
}

function createVis_stacked() {

	// TO-DO: Instantiate visualization objects here
	// areachart = new ...
  areachart = new StackedAreaChart("stacked-area-chart",allData.layers);
  timeline = new Timeline("timeline",allData.years);


}


function brushed() {

	// TO-DO: React to 'brushed' event
	// Set new domain if brush (user selection) is not empty
     areachart.x.domain(
         timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent()
     );
     // Update focus chart (detailed information)
     areachart.wrangleData();

     filtered = true;
     

}
