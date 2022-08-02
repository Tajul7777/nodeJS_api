// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

// Create chart instance
var chart = am4core.create("chartdiv", am4charts.XYChart);

// Add data
chart.data = [{
    "country": "USA", 
    "visits": 2025
  }, {
    "country": "China",
    "visits": 1882
  }, {
    "country": "Japan",
    "visits": 1809
  }, {
    "country": "Germany",
    "visits": 1322
  }, {
    "country": "UK",
    "visits": 1122
  }, {
    "country": "France",
    "visits": 1114
  }, {
    "country": "India",
    "visits": 984
  }, {
    "country": "Spain",
    "visits": 711
  }, {
    "country": "Netherlands",
    "visits": 665
  }, {
    "country": "Russia",
    "visits": 580
  }, {
    "country": "South Korea",
    "visits": 443
  }, {
    "country": "Canada",
    "visits": 441
  }, {
    "country": "Brazil",
    "visits": 395
  }];

// Create axes

//X
var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "country"; //chart.data .country
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.minGridDistance = 30;

categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
  if (target.dataItem && target.dataItem.index & 2 == 2) {
    return dy + 25;
  }
  return dy;
});

//Y
var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

// Create series
var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.valueY = "visits";
series.dataFields.categoryX = "country";
series.name = "Visits";
series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
series.columns.template.fillOpacity = .8;

var columnTemplate = series.columns.template;
columnTemplate.strokeWidth = 2;
columnTemplate.strokeOpacity = 1;

// This method will not work, it appends the colors to an existent list
// var colors = ['#2776BD', '#00A1D0','#00C195','#7ED321','#A8C600','#C9B600','#E3A600', '#F7941E', '#FC7149'];
// colors.forEach(function(hex) {
//   chart.colors.list.push(am4core.color(hex));
// });

// This method works because we manually override the chart's ColorSet
// @link https://www.amcharts.com/docs/v4/concepts/colors/#XY_Chart_and_derivative_charts
// var colors = ['#2776BD', '#00A1D0','#00C195','#7ED321','#A8C600','#C9B600','#E3A600', '#F7941E', '#FC7149'];
// var am4colors = [];
// colors.forEach(function(hex) {
//   am4colors.push(am4core.color(hex)); 
// });
// chart.colors.list = am4colors;

// This is the same as the above
chart.colors.list = [
  am4core.color("#2776BD"),
  am4core.color("#00A1D0"),
  am4core.color("#00C195"),
  am4core.color("#7ED321"),
  am4core.color("#A8C600"),
  am4core.color("#C9B600"),
  am4core.color("#E3A600"),
  am4core.color("#F7941E"),
  am4core.color("#FC7149")
];
series.columns.template.events.once("inited", function(event){
  event.target.fill = chart.colors.getIndex(event.target.dataItem.index);
});