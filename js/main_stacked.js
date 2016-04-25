
// Will be used to the save the loaded JSON data
var allData_big = [];
var allData=[];
// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;



// Variables for the visualization instances
var areachart, timeline;
var filtered = false;
var country_chosen="United States";

// Start application by loading the data
loadData_stacked();

function loadData_stacked() {
	d3.json("data/All_countries.json", function(error, jsonData){
		if(!error){
			allData = jsonData;

			// Select Appropriate country
			console.log(allData[0])
			// Convert years to date objects

			for (i = 0; i < allData.length; i++) {
				allData[i].layers.forEach(function (d) {
					for (var column in d) {
						if (d.hasOwnProperty(column) && column == "Year") {
							d[column] = parseDate(d[column].toString());
						}
					}
				});

				allData[i].years.forEach(function(d){
				 d.Year = parseDate(d.Year.toString());
				 })
			}

			
			//allData=allData_big.country_chosen;
			//console.log(allData_big.country_chosen)


			createVis_stacked();
		}
	});
}

function createVis_stacked() {

	// TO-DO: Instantiate visualization objects here
	// areachart = new ...
  areachart = new StackedAreaChart("stacked-area-chart",allData,country_chosen);
	timeline = new Timeline("timeline",allData);


}


function brushed() {

	// TO-DO: React to 'brushed' event
	// Set new domain if brush (user selection) is not empty
     areachart.x.domain(
         timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent()
     );
     // Update focus chart (detailed information)
     areachart.updateVis();

     filtered = true;
     

}
