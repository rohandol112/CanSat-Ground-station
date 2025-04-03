// csvToMongoDB.js - Script to read CSV and upload to MongoDB
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

// API endpoint (your Express server)
const API_URL = 'http://localhost:5000/api/flightData/batch';

// Function to read CSV and send to MongoDB
async function importCSVToMongoDB(filePath) {
  const results = [];
  
  // Read CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      // Parse the CSV data
      const parsedData = {
        id: parseInt(data.id) || 0,
        altitude: parseFloat(data.altitude) || 0,
        status: parseInt(data.status) || 0,
        temperature: parseFloat(data.temperature) || 0,
        pressure: parseFloat(data.pressure) || 0,
        sensor1: parseFloat(data.sensor1) || 0,
        sensor2: parseFloat(data.sensor2) || 0,
        sensor3: parseFloat(data.sensor3) || 0,
        sensor4: parseFloat(data.sensor4) || 0,
        sensor5: parseFloat(data.sensor5) || 0,
        sensor6: parseFloat(data.sensor6) || 0,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
      };
      
      results.push(parsedData);
    })
    .on('end', async () => {
      try {
        // Send data to MongoDB via API
        const response = await axios.post(API_URL, results);
        console.log(`Successfully imported ${results.length} records:`, response.data);
      } catch (error) {
        console.error('Error sending data to MongoDB:', error.message);
      }
    });
}

// Function to poll CSV file and update MongoDB
function setupCSVPolling(filePath, interval = 5000) {
  console.log(`Starting CSV polling every ${interval}ms...`);
  
  // Initial import
  importCSVToMongoDB(filePath);
  
  // Set up interval for continuous polling
  const pollId = setInterval(() => {
    importCSVToMongoDB(filePath);
  }, interval);
  
  return pollId;
}

// Usage example
const csvFilePath = './flight_data.csv';
setupCSVPolling(csvFilePath);