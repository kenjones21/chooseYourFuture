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
