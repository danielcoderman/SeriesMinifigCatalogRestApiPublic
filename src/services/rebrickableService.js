import fetch from 'node-fetch';
import { setTimeout as setTimeoutPromise } from 'timers/promises';
import dotenv from 'dotenv';
import { RebrickableAPIError } from '../utils/errors.js';
import path from 'path';

// Ensure .env is loaded from project root
const serviceDir = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(serviceDir, '../..');
dotenv.config({ path: path.join(projectRoot, '.env') });

class RebrickableService {
  constructor() {
    this.apiKey = process.env.REBRICKABLE_API_KEY;
    this.baseUrl = 'https://rebrickable.com/api/v3/lego';
    this.lastRequestTime = 0;
  }

  async delay() {
    const now = Date.now();
    const timeToWait = Math.max(0, 1000 - (now - this.lastRequestTime));
    if (timeToWait > 0) {
      await setTimeoutPromise(timeToWait);
    }
    this.lastRequestTime = Date.now();
  }

  async getMinifigureInventory(setNum) {
    await this.delay();

    // console.log('Using API Key:', this.apiKey ? 'Key is present' : 'Key is missing');
    const url = `${this.baseUrl}/sets/${setNum}/parts/?inc_color_details=0&inc_minifig_parts=1`;
    // console.log('Request URL:', url);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

      const response = await fetch(url, {
        headers: {
          'Authorization': `key ${this.apiKey}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        const errorText = await response.text();
        throw new RebrickableAPIError(
          response.status,
          `Failed to fetch data: ${errorText}`
        );
      }
  
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new RebrickableAPIError(
          408, 
          'Request to Rebrickable API timed out after 15 seconds'
        );
      } else if (error instanceof RebrickableAPIError) {
        throw error
      } else {
        throw new RebrickableAPIError(
          500, 
          `Unknown error occurred: ${error.message}`
        );
      }
    }
  }
}

export const rebrickableService = new RebrickableService();
