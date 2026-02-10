const fs = require('fs');
// Non-urgent: Maybe rename this to ParseTransformData
const parseJsonData = (jsonPath) => {
  // This returns the JavaScript object version of the JSON (Usually a list of JS objects in our case).
  return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
};

const transformSeriesData = (jsonPath) => {
  const series = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  return series.map(series => ({
    id: series.id,
    name: series.name,
    image_url: series.imageUrl,
    num_of_minifigs: series.numOfMinifigs,
    release_date: series.releaseDate,
  }));
};

const transformMinifigureData = (jsonPath) => {
  const minifigures = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  return minifigures.map(minifig => ({
    id: minifig.id,
    name: minifig.name,
    image_url: minifig.imageUrl,
    position_in_series: minifig.positionInSeries,
    series_id: minifig.seriesId,
  }));
};

module.exports = {
  parseJsonData,
  transformSeriesData,
  transformMinifigureData
};