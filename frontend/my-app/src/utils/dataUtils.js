export const readFlightData = async () => {
  try {
    // Add a cache-busting parameter to avoid browser caching
    const response = await fetch(`/flight_data.csv?t=${new Date().getTime()}`);
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n');
    
    // Skip empty lines and handle the case where there are no headers
    const validLines = lines.filter(line => line.trim() !== '');
    
    if (validLines.length === 0) {
      return [];
    }
    
    // Define column indices based on your CSV structure
    const data = [];
    for (let i = 0; i < validLines.length; i++) {
      const values = validLines[i].split(',');
      
      // Check if this is a valid data row (should have at least 12 columns)
      if (values.length < 12) continue;
      
      // Parse the data based on the column structure you provided
      try {
        data.push({
          id: parseInt(values[0]) || 0,
          altitude: parseFloat(values[1]) || 0,
          status: parseInt(values[2]) || 0,
          temperature: parseFloat(values[3]) || 0,
          pressure: parseFloat(values[4]) || 0,
          sensor1: parseFloat(values[5]) || 0,
          sensor2: parseFloat(values[6]) || 0,
          sensor3: parseFloat(values[7]) || 0,
          sensor4: parseFloat(values[8]) || 0,
          sensor5: parseFloat(values[9]) || 0,
          sensor6: parseFloat(values[10]) || 0,
          timestamp: values[11] ? new Date(values[11]).getTime() : Date.now()
        });
      } catch (e) {
        console.error('Error parsing data row:', e, values);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error reading flight data:', error);
    return [];
  }
};

// Set up a polling mechanism to continuously fetch the latest flight data
export const setupFlightDataPolling = (callback, interval = 5000) => {
  // Fetch immediately on setup
  readFlightData().then(callback);
  
  // Then set up interval for continuous polling
  const pollId = setInterval(async () => {
    const data = await readFlightData();
    callback(data);
  }, interval);
  
  // Return the interval ID so it can be cleared if needed
  return pollId;
}; 