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
  let getLapsForDriver =
      getLapsForRace.filter(lap => lap.driverLastName === driverLastName);
  console.log(getLapsForDriver);

  // Set up chart area
  let margin = {left: 50, right: 50, top: 50, bottom: 50};
  const chartWidth = +d3.select('#mainView').style('width').slice(0, -2);
  const chartHeight = +d3.select('#mainView').style('height').slice(0, -2);
  const mainSVG = d3.select('#mainView')
                      .append('svg')
                      .attr('id', 'mainChart')
                      .attr('width', chartWidth)
                      .attr('height', chartHeight);

  // Start adding graphical elements
  let g = mainSVG.append('g').attr(
      'transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

