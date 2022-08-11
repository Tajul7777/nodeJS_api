
for (i = 0; i< overviewData.dailyYieldData.length;i++){
  //var years = new Date(overviewData.dailyYieldData[i][0]).getUTCDate();
  var date = new Date(overviewData.dailyYieldData[i][0]).toLocaleString("en-US", {day: "2-digit"});
  var month = new Date(overviewData.dailyYieldData[i][0]).toLocaleString("en-US", {month: "2-digit"});
  //var values =  overviewData.yearlyYieldData[i][1];
  console.log("Date and Month: "+date+"."+month);
  overviewData.dailyYieldDataForAmChart.push({
      "dateMonth": date+"."+month,
      "value1": overviewData.dailyYieldData[i][1],
      "value2": overviewData.dailyTargetYieldData[i][1]
  });

}
console.log(overviewData.dailyYieldDataForAmChart)