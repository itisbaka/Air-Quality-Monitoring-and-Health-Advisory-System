import { get, post } from './api';

export function listLocations() {
  return get('/environment/locations/');
}

export function createLocation(payload) {
  return post('/environment/locations/', payload);
}

export function listAQIReadings() {
  return get('/environment/aqi-readings/');
}

export function createAQIReading(payload) {
  return post('/environment/aqi-readings/', payload);
}
