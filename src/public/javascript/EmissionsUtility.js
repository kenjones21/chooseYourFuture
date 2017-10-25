/**
 * Sums emissions from multiple years, recursively if necessary
 * @param {Number} years
 * @return {Number} sum
*/
exports.sumEm = function(years) {
  sum = 0
  years.forEach(function(year) {
    if (Array.isArray(year)) {
      sum += exports.sumEm(year)
    }
    else {
      sum += year.em
    }
  })
  return sum
}

/**
 * Divides emissions into n+1 bins (arrays), where n is length of budgetThresholds
 * Years are duplicated between bins ie [1, 2], [2, 3]
 * @param {Array} futureData
 * @param {Array} budgetThresholds
 * @return {Array} Array of arrays containing years
 */
exports.divideEmissions = function(futureData, budgetThresholds) {
  // Divides emissions into n+1 bins, where n is length of budgetThresholds
  // Years are duplicated between bins
  var sum = 0
  var i = 0
  var threshold = budgetThresholds[0]
  var retarr = [[]]
  for (var j = 0; j < futureData.length; ++j) {
    var y = futureData[j]
    sum += y.em
    if (sum > threshold) {
      retarr[i].push(y) // Duplication
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
  }
  while (retarr.length < budgetThresholds.length + 1) {
    retarr.push([])
  }
  return retarr
}

/**
 * Translates thresholds from one year to another, given the years emissions
 * in between
 * @param {Number} y1
 * @param {Number} y2
 * @param {Array} y1Thresholds
 * @param {Array} years
 * @return {Array} thresholds
 */
exports.thresholdsTranslate = function(y1, y2, y1Thresholds, years) {
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

/**
 * Finds index of exceedanceData object immediately at or after emissions
 * @param {Array} exceedanceData
 * @param {Number} emissions
 * @return {Number} i
 */
exports.find = function(exceedanceData, emissions) {
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

/**
 * Estimates probability of exceeding some threshold given emissions
 * Returns 0 if exceedance data is not defined
 * @param {Array} exceedanceData
 * @param {Number} emissions
 * @return {Number} Probability of exceedance
*/
exports.estimateExceedanceProbability = function(exceedanceData, emissions){
  if (!exceedanceData) {
    console.log("notta")
    return 0
  }
  index = find(exceedanceData, emissions)
  var ret = exceedanceData[index]
  return ret.Smooth
}
