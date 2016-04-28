
// Will be used to the save the loaded JSON data
var allData_UN=[];
// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;



// Variables for the visualization instances
var areachart2, areachart;
var filtered = false;
var country_chosen_st="Canada";


// Start application by loading the data
loadData_stacked();

function loadData_stacked() {
	d3.json("data/All_countries.json", function(error, jsonData){
		if(!error){
			allData_UN = jsonData;



			// Select Appropriate country
			//console.log(allData_UN[0])
			// Convert years to date objects

			for (i = 0; i < allData_UN.length; i++) {
				allData_UN[i].layers.forEach(function (d) {
					for (var column in d) {
						if (d.hasOwnProperty(column) && column == "Year") {
							d[column] = parseDate(d[column].toString());
						}
					}
				});

				allData_UN[i].years.forEach(function(d){
					d.Year = parseDate(d.Year.toString());
				})
			}


			//allData_UN=allData_big.country_chosen;
			//console.log(allData_big.country_chosen)


			createVis_stacked2();



		}
	});
}

function createVis_stacked2() {

	// TO-DO: Instantiate visualization objects here
	// areachart = new ...


	areachart2 = new StackedAreaChart("stacked-area-chart2",allData_UN,country_chosen_st,200);
	areachart = new StackedAreaChart("stacked-area-chart",allData_UN,country_chosen_st,700);


}


//function brushed() {
//
//	// TO-DO: React to 'brushed' event
//	// Set new domain if brush (user selection) is not empty
//	areachart.x.domain(
//		timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent()
//	);
//	// Update focus chart (detailed information)
//	areachart.updateVis();
//
//	filtered = true;
//
//
//}
//
