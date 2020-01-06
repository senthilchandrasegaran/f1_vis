// Check is the page is loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', function(event) {
  d3.queue()
      .defer(d3.csv, '../data/lap_times.csv')
      .defer(d3.csv, '../data/drivers.csv')
      .await(plotData);
});

function plotData(err, lapTimes, driverData) {
  if (err) return console.error('Error reading file:', err);

  // Add driver first name and last name to lap data
  lapTimes.forEach(function(lap) {
    let getDriver = driverData.find(driver => driver.driverId === lap.driverId);
    lap['driverFirstName'] = getDriver.forename;
    lap['driverLastName'] = getDriver.surname;
  });

  // Filter lap data by Race ID
  const raceId = '841';
  let getLapsForRace = lapTimes.filter(lap => lap.raceId === raceId);

  // Filter lap data further by driver last name
  let driverLastName = 'Vettel';

  function getLapsForDriver(driverLastName) {
    return getLapsForRace.filter(lap => lap.driverLastName === driverLastName);
  }

  let listOfDriversForRace = [];
  getLapsForRace.forEach(lap => listOfDriversForRace.push(lap.driverLastName));
  let uniqueListOfDriversForRace = [...new Set(listOfDriversForRace)];
  console.log(uniqueListOfDriversForRace);


  // Set up chart area
  let margin = {left: 50, right: 50, top: 50, bottom: 50};
  const chartWidth = +d3.select('#mainView').style('width').slice(0, -2) -
      margin.left - margin.right;
  const chartHeight = +d3.select('#mainView').style('height').slice(0, -2) -
      d3.select('#main-view-header').style('height').slice(0, -2) -
      d3.select('#dummy-text').style('height').slice(0, -2) - margin.top -
      margin.bottom;
  const mainSVG = d3.select('#mainView')
                      .append('svg')
                      .attr('id', 'mainChart')
                      .attr('width', chartWidth)
                      .attr('height', chartHeight);

  let maxLaps =
      getLapsForRace.reduce((a, b) => ({'lap': Math.max(a.lap, b.lap)}));
  let maxPositions = getLapsForRace.reduce(
      (a, b) => ({'position': Math.max(a.position, b.position)}))

  let x = d3.scaleLinear().domain([0, maxLaps.lap]).range([0, chartWidth]);
  let y = d3.scaleLinear().domain([0, maxPositions.position]).range([
    0, chartHeight
  ]);

  let g = mainSVG.append('g').attr(
      'transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Start adding graphical elements
  function drawDriverPosition(driver) {
    // driver-level graphics
    let driverLaps = getLapsForDriver(driver);
    console.log(driverLaps);

    let positionLine = d3.line()
                           .x(function(d) {
                             return x(d.lap);
                           })
                           .y(function(d) {
                             return y(d.position);
                           });

    let line = g.append('g')
                   .append('path')
                   .attr('stroke', '#444')
                   .attr('fill', 'none')
                   .attr('stroke-width', 2)
                   .attr('d', positionLine(driverLaps));

    // Add driver name to line on the chart
    g.append('text')
        .attr('transform', 'translate(0,' + y(driverLaps[0].position) + ')')
        .attr('dy', '-0.3em')
        .attr('dx', '1em')
        .attr('text-anchor', 'left')
        .text(driver)
  }

  uniqueListOfDriversForRace.forEach(d => drawDriverPosition(d));

  // Add Axes
  let yAxisLeft = d3.axisLeft().scale(y);
  let xAxisTop = d3.axisTop().scale(x);
  let yAxisRight = d3.axisRight().scale(y);
  let xAxisBottom = d3.axisBottom().scale(x);

  g.append('g')
      .attr('class', 'xaxis')
      .attr('transform', 'translate(0,0)')
      .call(xAxisTop.ticks(maxLaps.lap / 2));
  g.append('g')
      .attr('class', 'yaxis')
      .attr('transform', 'translate(0,0)')
      .call(yAxisLeft.ticks(maxPositions.position));

  g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)  // x and y get interchanged after rotation
      .attr('y', -margin.left / 2)
      .style('text-anchor', 'middle')
      .style('font-weight', '600')
      .text('Position');

  g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -margin.top / 2)
      .style('text-anchor', 'middle')
      .style('font-weight', '600')
      .text('Lap');
}

