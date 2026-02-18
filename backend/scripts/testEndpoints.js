import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5006/api';

const tests = [
  {
    name: 'Health Check',
    url: `${BASE_URL}/health`,
    method: 'GET'
  },
  {
    name: 'Business Categories',
    url: `${BASE_URL}/business-categories`,
    method: 'GET'
  },
  {
    name: 'Public Restaurants',
    url: `${BASE_URL}/public/restaurants?limit=5`,
    method: 'GET'
  },
  {
    name: 'Public Stats',
    url: `${BASE_URL}/public/stats`,
    method: 'GET'
  }
];

async function runTests() {

  for (const test of tests) {
    try {
      const response = await fetch(test.url, { method: test.method });
      const data = await response.json();
      
      if (response.ok && data.success !== false) {

        if (data.data) {
          if (Array.isArray(data.data)) {

          } else if (typeof data.data === 'object') {

          }
        }
      } else {



      }
    } catch (error) {


    }

  }
  

}

runTests();