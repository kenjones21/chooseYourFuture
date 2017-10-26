/*
  --- INTERPOLATION FUNCTIONS ---
*/

var toPeak = function(lastYear, ePrimeLastYear, peakYear) {
  toPeakYears = []
  toPeakYears.push(lastYear)
  if (lastYear.em > peakYear.em) {
    console.log("Dragged it too low dipshit")
    return []
  }
  var peak_year = Math.floor(peakYear.year)
  var x_half = (peakYear.year - lastYear.year) * 0.5
  var delta_em = peakYear.em - lastYear.em
  var edge = 1/2 * x_half * ePrimeLastYear

  var y = -1
  var em_y = -1
  if (delta_em < edge) {
    yearFlat = 2 * delta_em / ePrimeLastYear + lastYear.year
    if (yearFlat == lastYear.year) {
      console.log("Emissions totally flat")
      m = 0
    }
    else {
      m = -ePrimeLastYear / (yearFlat - lastYear.year) // m
    }
    var C = lastYear.em - ePrimeLastYear * lastYear.year + (m * lastYear.year * lastYear.year)/2
    // f((y) = E(2016) +  E'y + my^2/2 - 2016my
    var f = function(y) {
      return C + ePrimeLastYear * y + m*y*y/2 - lastYear.year * m * y
    }
    em_y = f(lastYear.year)
    for (y = lastYear.year + 1; y <= yearFlat; ++y) {
      em_y = f(y)
      year_i = {
	year: y,
	em: em_y
      }
      toPeakYears.push(year_i)
    }
    for (; y <= peak_year; ++y) {
      year_i = {
	year: y,
	em: em_y
      }
      toPeakYears.push(year_i)
    }
    return toPeakYears
  }
  
  else {
    var h = delta_em/x_half - 0.5 * ePrimeLastYear
    var m1 = (h - ePrimeLastYear) / x_half
    var C1 = lastYear.em - ePrimeLastYear * lastYear.year +
	m1 / 2 * lastYear.year * lastYear.year

    var f1 = function(y) {
      return C1 + ePrimeLastYear * y + m1*y*y/2 - lastYear.year * m1 * y
    }
    
    for (y = lastYear.year + 1; y <= lastYear.year + x_half; ++y) {
      em_y = f1(y)
      year_i = {
	year: y,
	em: em_y
      }
      toPeakYears.push(year_i)
    }

    var m2 = h / x_half
    var f1ph = ePrimeLastYear + m1 * (x_half)
    var C2 = peakYear.em + m2 * peakYear.year * peakYear.year / 2 - f1ph * peakYear.year -
	m2 * (x_half + lastYear.year) * peakYear.year

    var f2 = function(y) {
      return C2 + f1ph * y - m2 * y * y / 2 + m2 * y * (lastYear.year + x_half)
    }

    for (; y <= peak_year; ++y) {
      em_y = f2(y)
      year_i = {
	year: y,
	em: em_y
      }
      toPeakYears.push(year_i)
    }
    
    return toPeakYears
  }
}

var peakTo0 = function(peakYear, year0) {
  var pad = 0.01
  var emPad = pad * peakYear.em
  var years = []
  peak_year = Math.floor(peakYear.year)

  var f = function(y) {
    // return A * exp(-y^2/(2 * c))
    var A = peakYear.em
    var c = -1 * Math.pow((year0.year - peakYear.year), 2) / (2 * Math.log(pad))
    return A * Math.exp(-1 * Math.pow((y - peakYear.year), 2) / (2 * c))
  }
  for (var y = peak_year + 1; y < year0.year; ++y) {
    year = {
      year: y,
      em: f(y)
    }
    years.push(year)
  }
  return years
}

var futureData = function(hist, peak, em0) {
  var finalYear = 2100
  var histToPeak = toPeak(hist[hist.length - 1], 0.5, peak)
  var peakToZero = peakTo0(peak, em0)
  var zeroToEnd = []
  for (var y = Math.floor(em0.year); y < finalYear; ++y) {
    zeroToEnd.push({year: y, em: 0})
  }
  return histToPeak.concat(peakToZero).concat(zeroToEnd)
}

/*
  --- UTILITY FUNCTIONS ---
*/

var sumEm = function(years) {
  sum = 0
  years.forEach(function(year) {
    if (Array.isArray(year)) {
      sum += sumEm(year)
    }
    else {
      sum += year.em
    }
  })
  return sum
}

  // Divides emissions into n+1 parts, where n is length of budgetThresholds
var divideEmissions = function(futureData, budgetThresholds) {
  var sum = 0
  var i = 0
  var threshold = budgetThresholds[0]
  var retarr = [[]]
  futureData.forEach(function(y) {
    sum += y.em
    if (sum > threshold) {
      retarr[i].push(y) // Need duplicates for fill to work
      retarr.push([])
      i += 1
      if (i < budgetThresholds.length) {
	threshold = budgetThresholds[i]
      }
      else {
	threshold = Number.MAX_VALUE
      }
    }
    retarr[i].push(y)
  })
  while (retarr.length < budgetThresholds.length + 1) {
    retarr.push([])
  }
  return retarr
}

// Various functions for converting strings to numbers, used in d3.csv
function toNum(d){
  d.year = +d.Year
  d.em = (+d.Total) * (44/12000)
  return d
}

function num(d) {
  d.em = +d.Emissions
  return d
}

function numSmooth(d) {
  for (var key in d) {
    if (d.hasOwnProperty(key)) {
      d[key] = +d[key]
    }
  }
  return d
}

// Translates thresholds from y1 to y2 given years in between
function thresholdsTranslate(y1, y2, y1Thresholds, years) {
  var thresholds = y1Thresholds.slice() // Copy y1Thresholds
  for (i = 0; i < years.length; i++) {
    yearObj = years[i]
    year = yearObj.year
    if (year >= y1 && year < y2) {
      em = yearObj.em
      for (j = 0; j < thresholds.length; ++j) {
	thresholds[j] -= em
      }
    }
  }
  return thresholds
}

// Finds index in exceedanceData immediately at or after emissions
function find(exceedanceData, emissions) {
  prevDatum = exceedanceData[0]
  if (emissions < prevDatum.em) {
    return -1 // -1 if emissions are too small for dataset
  }
  for (var i = 0; i < exceedanceData.length; ++i) {
    datum = exceedanceData[i]
    if (emissions <= datum.em && emissions > prevDatum.em) {
      return i
    }
  }
  return exceedanceData.length // If it's beyond dataset, return length of dataset
}

// Estimates probability of exceeding temperature threshold, defined by
// objects in exceedanceData
function estimateExceedanceProbability(exceedanceData, emissions){
  if (!exceedanceData) {
    console.log("notta")
    return 0
  }
  index = find(exceedanceData, emissions)
  var ret = exceedanceData[index]
  return ret.Smooth
}

// Makes request to server to fill out tempDict, which estimates probability
// of exceedance for a given temperature based on IPCC scenario database
function getSmoothedProbs() {
  d3.csv("/api/smoothed_csv", numSmooth, function(error, data) {
    tempDict = {"one_five": [], "two": [], "three": [], "four": []}
    for (i = 0; i < data.length; ++i) {
      var datum = data[i]
      for (var key in datum) {
	if (datum.hasOwnProperty(key) && key != "em") {
	  var datumToPush = {"Smooth": datum[key], "em": datum.em}
	  tempDict[key].push(datumToPush)
	}
      }
    }
    console.log(budget)
    makeBarChart(budget)
  })
}

// Gets stats for a certain temperature. Based on following report: 
// http://dels.nas.edu/resources/static-assets/materials-based-on-reports/
// booklets/warming_world_final.pdf
function getStats(temp) {
  var stats = []
  if (temp < 2) {
    var fireMin = temp * 2
    var fireMax = temp * 4
    var fire = {"name": "fire", "status": "known", "min": fireMin, "max": fireMax}
    stats.push(fire)
  }
  else {
    stats.push({"name": "fire", "status": "unknown"})
  }
  if (temp < 4) {
    stats.push({"name": "heavyRain", "status": "known",
		"min": temp * 0.03, "max": temp * 0.1})
    stats.push({"name": "rain", "status": "known",
		"min": temp * 0.05, "max": temp * 0.1})
    stats.push({"name": "corn", "status": "known",
		"min": temp * 0.05, "max": temp * 0.15})
  }
  else {
    stats.push({"name": "heavyRain", "status": "unknown"})
    stats.push({"name": "rain", "status": "unknown"})
    stats.push({"name": "corn", "status": "unknown"})
  }
  return stats
}

//             --- DATA VARIABLES ---

var thresholds2011 = [400, 1000, 2400]
var thresholds2017 = []
var default_peak = {year: 2050, em: 60}
var paris_peak = {year: 2030, em: 38.5}
var RCP26_peak = {year: 2030, em: 38}
var RCP26_em0 = {year: 2070, em: 0}
var committed_peak = {year: 2017, em: 36.51}
var committed_em0 = {year: 2064.5, em: 0}
var current_policy2030 = {year: 2030, em: 46}
var peak = Object.assign({}, default_peak)
var em0 = {year: 2080, em: 1}
var histData = []
var lastYear = {}
var budget = 0
var probs = [0, 0, 0, 0]
var temp = 1
var medianB = 1.38531
var medianM = 0.0007436709

//            --- CHART VARIABLES ---

var margin = {top: 10, right: 20, bottom: 30, left: 40}
var barMargin = {top: 10, right: 20, bottom: 30, left: 20}
var width = d3.select("#emissionsChart").style("width")
width = +width.substring(0, width.length - 2)
console.log(width)
var barGraphWidth = d3.select("#barChart").style("width")
barGraphWidth = +barGraphWidth.substring(0, barGraphWidth.length - 2)
// var width = 800 - margin.left - margin.right
var ratio = 9/16
var height = width * ratio
var r = 15
//    var barGraphWidth = width + margin.left + margin.right - barMargin.left - barMargin.right
var barGraphHeight = barGraphWidth
var barHeight = barGraphHeight / 8
var barSpace = (barGraphHeight - 4 * barHeight) / 4

var chart = d3.select("#emissionsChart")
    .attr("class", "emissionsChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var barChart = d3.select("#barChart")
    .attr("class", "barChart")
    .attr("width", barGraphWidth + barMargin.left + barMargin.right)
    .attr("height", barGraphHeight + barMargin.top + barMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");
var tempDict = {}

x = d3.scaleLinear()
  .domain([1955, 2100])
  .range([0, width])

y = d3.scaleLinear()
  .domain([0, 60])
  .range([height, 0])

var barX = d3.scaleLinear()
    .range([0, barGraphWidth])
    .domain([0, 1])

var area = d3.area()
    .x(function(d) {return x(d.year)})
    .y0(height)
    .y1(function(d) {return y(d.em)})

var colors = ["#fef0d9", "#fdcc8a", "#fc8d59", "#d7301f"]
var temps = ["one_five", "two", "three", "four"]
var tempNumbers = ["1.5", "2", "3", "4+"]

//          --- CONTROLLER FUNCTIONS ---

var paris = function() {
  peak = Object.assign({}, paris_peak)
  updateChart()
}

var committed = function() {
  peak = Object.assign({}, committed_peak)
  em0 = Object.assign({}, committed_em0)
  updateChart()
}

var rcp3 = function() {
  peak = Object.assign({}, RCP26_peak)
  em0 = Object.assign({}, RCP26_em0)
  updateChart()
}

//               --- CHART FUNCTIONS

var tempFormat = d3.format(".1f")
var percentFormat = d3.format(",.2p")
var round = function(num, index) {
  // Rounds num to index 0's.
  // round(5839.4, 2) returns 5800
  roundNum = Math.pow(10, index)
  return Math.round(num/roundNum) * roundNum
}

function drawHist(hist) {
  // Draws hist on graph. Does not update or delete old hists
  chart.append("path")
    .datum(hist)
    .attr("d", area)
    .attr("class", "hist")
    .style("fill", "grey")
}

function drawFuture(futureArr) {
  chart.selectAll(".future")
    .data(futureArr, function(d, i) {return i})
    .enter().append("path")
    .attr("d", area)
    .attr("class", "future")
    .style("fill", function(d, i) {
      return colors[i]
    })
}

function drawLegend() {
  temp = medianB + medianM * budget
  
  chart.append("text")
    .datum(budget)
    .attr("class", "budget")
    .attr("transform", function(d, i) {
      var transx = width/4
      var transy = height * 3/4
      return "translate(" + width*3/4 + "," + ((height * 1 / 4)) + ")"
    })
    .text(function(d) {return round(d, 2)})
    .style("fill", "blue")
    .style("font-size", "20px")
  
  chart.append("text")
    .datum(temp)
    .attr("class", "median")
    .attr("transform", function(d) {
      var transx = width/4
      var transy = height * 3/4 + 20
      return "translate(" + width*3/4 + "," + transy + ")"
    })
    .text(function(d) {return tempFormat(d)})
    .style("font-size", "20px")
    .style("fill", "white")

  chart.selectAll(".legend")
    .data(colors)
    .enter().append("rect")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(" + (margin.left * 2 - 40) + "," + (height/4 + i * 50) + ")"
    })
    .attr("width", 30)
    .attr("height", 30)
    .style("fill", function(d) {return d})

  chart.selectAll(".legendTemp")
    .data(tempNumbers)
    .enter().append("text")
    .attr("transform", function(d, i) {
      return "translate(" + (margin.left * 2) + "," + (height/4 + i * 50 + 20) + ")"
    })
    .text(function(d) {return d})
    .style("fill", "white") 
}

function updateLegend() {
  chart.select(".budget")
    .datum(budget)
    .text(function(d) {return round(d, 2)})
  chart.select(".median")
    .datum(temp)
    .text(function(d) {return tempFormat(d)})
}

function updateFuture() {
  chart.selectAll(".future")
    .data(futureArr)
    .attr("d", area)
    .style("fill", function(d, i) {return colors[i]})
}

function drawNodes(defaultPeak, default0, histData) {
  
  function dragged_peak(d) {
    var year = x.invert(d3.event.x)
    if (year < em0.year && year > histData[histData.length - 1].year) {
      peak.year = year
      d3.select(this).attr("cx", d3.event.x)
    }
    else if (year >= em0.year) {
      peak.year = em0.year
      d3.select(this).attr("cx", x(peak.year))
    }
    else if (year < lastYear.year) {
      peak.year = lastYear.year
      d3.select(this).attr("cx", x(peak.year))
    }
    var em = y.invert(d3.event.y)
    if (em > lastYear.em) {
      peak.em = em
      d3.select(this).attr("cy", d3.event.y)
    }
    else {
      peak.em = lastYear.em + 0.01
      d3.select(this).attr("cy", y(peak.em))
    }
    updateChart()
  }

  function dragged_0(d) {
    var year = x.invert(d3.event.x)
    if (year > peak.year && year < 2100) {
      d3.select(this).attr("cx", d3.event.x);
      em0.year = x.invert(d3.event.x)
    }
    else if (year <= peak.year) {
      console.log("too far left")
      em0.year = peak.year
      d3.select(this).attr("cx", x(peak.year))
    }
    else {
      console.log("too far right")
      em0.year = 2100
      d3.select(this).attr("cx", x(2100))
    }
    updateChart()
  }

  chart.append("circle")
    .datum(peak)
    .attr("cx", function(d) {return x(d.year)})
    .attr("cy", function(d) {return y(d.em)})
    .attr("r", r)
    .attr("class", "peak")
    .style("fill", "white")
    .style("stroke", "grey")
    .call(d3.drag().on("drag", dragged_peak))

  chart.append("circle")
    .datum(em0)
    .attr("cx", function(d) {return x(d.year)})
    .attr("cy", y(0) - r)
    .attr("r", r)
    .attr("class", "em0")
    .style("fill", "white")
    .style("stroke", "grey")
    .call(d3.drag().on("drag", dragged_0))
}

function updatePeak() {
  d3.select(".peak")
    .datum(peak)
    .attr("cx", function(d) {return x(d.year)})
    .attr("cy", function(d) {return y(d.em)})
}

function updateEm0() {
  d3.select(".em0")
    .datum(em0)
    .attr("cx", function(d) {return x(d.year)})
    .attr("cy", function(d) {return y(0) - r})
}

function drawAxes() {
  var xAxis = d3.axisBottom(x),
      yAxis = d3.axisLeft(y)

  xAxis.tickFormat(d3.format("d"))
  yAxis.tickPadding(15)
  
  chart.append("g")
    .attr("class", "x_axis axis emissions_axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

  chart.append("g")
    .attr("class", "y_axis axis emissions_axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Mt CO2/yr")
}

function makeChart(histData, futureArr) {
  drawHist(histData)
  drawFuture(futureArr)
  drawLegend(futureArr)
  drawNodes(peak, em0, histData)
  var emissionsSum = sumEm([].concat.apply([], futureArr))
  //      makeBarChart(emissionsSum)
  drawBarLines()
}

function makeBarChart(emissionsSum) {
  for (var i = 0; i < temps.length; ++i) {
    t = temps[i]
    probs[i] = estimateExceedanceProbability(tempDict[t], emissionsSum)
  }
  console.log(probs)
  barChart.selectAll(".prob")
    .data(probs)
    .enter().append("rect")
    .attr("class", "prob")
    .attr("width", function(d) {return barX(d)})
    .attr("height", barHeight)
    .attr("transform", function(d, i) {
      translate = barHeight * i + (1/2 + i) * barSpace
      return "translate(0," + translate + ")"
    })
    .style("fill", function(d, i) {return colors[i]})
}

function updateBarWidth() {
  //      var future = [].concat.apply([], futureArr)
  //      var sum = sumEm(future)
  function check (l, max) {
    return l < max
  }
  for (var i = 0; i < temps.length; ++i) {
    t = temps[i]
    probs[i] = estimateExceedanceProbability(tempDict[t], budget)
  }
  barChart.selectAll(".prob")
    .data(probs)
    .attr("width", function(d) {return barX(d)})
}

function drawBarAxis() {
  var barXAxis = d3.axisBottom(barX)
  barXAxis.tickFormat(d3.format(".0%"))
  barChart.append("g")
    .attr("class", "x_axis axis emissions_axis")
    .attr("transform", "translate(0," + barGraphHeight + ")")
    .call(barXAxis)
}

function drawBarLines() {
  var x0 = barX(0.33333)
  var line = barChart.append("line")
      .attr("display", null)
      .style("stroke", "white")
      .style("stroke-dasharray", ("5, 2"))
      .attr("x1", x0)
      .attr("y1", 0)
      .attr("x2", x0)
      .attr("y2", height);
}

function updateStats() {
  var stats = getStats(temp)
  d3.selectAll(".stat")
    .data(stats)
    .text(function(d) {
      if (d.status == "known") {
	var textStr = percentFormat(d.min) +
	    " - " + percentFormat(d.max)
	return textStr
      }
      else {
	return "unknown"
      }
    })
}

function updateChart() {
  future = futureData(histData, peak, em0)
  futureArr = divideEmissions(future, thresholds2017)
  updateFuture()
  var future = [].concat.apply([], futureArr); // Flatten array
  budget = sumEm(future)
  temp = medianB + medianM * budget
  updateLegend()
  updateBarWidth()
  updateStats()
  updatePeak()
  updateEm0()
}

drawAxes()
drawBarAxis()
d3.csv("/api/emissions_csv", toNum, function(error, data) {
  console.log(data)
  histData = data
  lastYear = histData[histData.length - 1]
  var future = futureData(histData, peak, em0)
  thresholds2017 = thresholdsTranslate(2011, 2017, thresholds2011, data)
  console.log(thresholds2017)
  var futureArr = divideEmissions(future, thresholds2017)
  future = [].concat.apply([], futureArr); // Flatten array
  budget = sumEm(future)
  console.log("Budget is ", budget)
  updateStats()
  makeChart(histData, futureArr)
})

getSmoothedProbs()


