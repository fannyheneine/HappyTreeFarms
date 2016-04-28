
// Will be used to the save the loaded JSON data
var data_p, data_i;
// Date parser to convert strings to date objects


// Variables for the visualization instances
var barchart, barchart2;
var selection="American";


// Start application by loading the data

queue()
    .defer(d3.csv, "data/all_cuisines_percentages.csv")
    .defer(d3.csv, "data/all_cuisines_ing.csv")
    .await(function(error, data_percentages, data_ing) {


        data_percentages.forEach(function (d) {

            // Convert numeric values to 'numbers'
            d.American = +d.American;
            d.Canadian = +d.Canadian;
            d.Caribbeans = +d.Caribbeans;
            d.Chinese = +d.Chinese;
            d.East_African = +d.East_African;
            d.East_European = +d.East_European;
            d.French = +d.French;
            d.British = +d.British;
            d.Indian = +d.Indian;
            d.Italian = +d.Italian;
            d.Japanese = +d.Japanese;
            d.Korean = +d.Korean;
            d.Mediterranean = +d.Mediterranean;
            d.Mexican = +d.Mexican;
            d.Middle_Eastern = +d.Middle_Eastern;
            d.North_African = +d.North_African;
            d.Portuguese_Spanish = +d.Portuguese_Spanish;
            d.Scandinavian = +d.Scandinavian;
            d.South_African = +d.South_African;
            d.South_American = +d.South_American;
            d.South_Asian = +d.South_Asian;
            d.Southeast_Asian = +d.Southeast_Asian;
            d.West_African = +d.West_African;
            d.West_European = +d.West_European;


        });

        data_p = data_percentages;
        data_i = data_ing;

        createVis_bar();

    });

function createVis_bar() {

    // TO-DO: Instantiate visualization objects here
    // areachart = new ...

    barchart = new BarChart("bar-chart",data_p, data_i, selection ,500);
    barchart2 = new BarChart("bar-chart2",data_p, data_i, selection ,200);



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
