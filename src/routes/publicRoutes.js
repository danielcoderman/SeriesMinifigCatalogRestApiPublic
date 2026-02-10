import express from 'express';
import Series from '../models/series.js';
import Minifigure from '../models/minifigure.js';
import MinifigureInventoryItem from '../models/minifigureInventoryItem.js';
import { Op } from 'sequelize';

const router = express.Router();
/**
 * Get all series or only updated series after a specific timestamp
 * @route GET /api/series
 * @query {string} [lastFetched] - Optional ISO 8601 timestamp (e.g., "2024-02-17T15:30:00Z")
 */
router.get('/series', async (req, res, next) => {
    try {
        const { lastFetched } = req.query; // If lastFetched is not present in req.query, the variable lastFetched will be undefined
        
        let query = {};
        
        if (lastFetched) {
            const lastFetchedDate = new Date(lastFetched);

            // Validate the timestamp
            // Invalid timestamp formats ("2024-02-19 25:00:00" or "2024-02-31") will result in an invalid Date object. This means
            // that the Date object will exist, but its internal value will be NaN (Not-a-Number). Calling getTime() on an invalid
            // Date object will return NaN.
            if (isNaN(lastFetchedDate.getTime())) {
                return res.status(400).json({
                    error: 'Invalid timestamp format. Please use ISO 8601 format (e.g., "2024-02-17T15:30:00Z")'
                });
            }

            query.where = {
                updated_at: {
                    [Op.gt]: lastFetchedDate
                }
            };
        }
        
        const series = await Series.findAll(query);
        
        res.json(series);
    } catch (error) {
        // Add context to the error message
        error.message = `Error fetching series: ${error.message}`;
        next(error); // Pass the error to the global error handler
    }
});

/**
 * Get all minifigures or only updated minifigures after a specific timestamp
 * @route GET /api/minifigures
 * @query {string} [lastFetched] - Optional ISO 8601 timestamp (e.g., "2024-02-17T15:30:00Z")
 */
router.get('/minifigures', async (req, res, next) => {
    try {
        const { lastFetched } = req.query;
        
        let query = {};
        
        if (lastFetched) {
            const lastFetchedDate = new Date(lastFetched);

            // Validate the timestamp is valid. We know it's valid if the Date object is valid.
            if (isNaN(lastFetchedDate.getTime())) {
                return res.status(400).json({
                    error: 'Invalid timestamp format. Please use ISO 8601 format (e.g., "2024-02-17T15:30:00Z")'
                });
            }

            query.where = {
                updated_at: {
                    [Op.gt]: lastFetchedDate
                }
            };
        }
        
        const minifigures = await Minifigure.findAll(query);
        
        res.json(minifigures);
    } catch (error) {
        // Add context to the error message
        error.message = `Error fetching minifigures: ${error.message}`;
        next(error); // Pass the error to the global error handler
    }
});

/**
 * Get all minifigure inventory items or only updated items after a specific timestamp
 * @route GET /api/minifigure-inventory-items
 * @query {string} [lastFetched] - Optional ISO 8601 timestamp (e.g., "2024-02-17T15:30:00Z")
 */
router.get('/minifigure-inventory-items', async (req, res, next) => {
    try {
        const { lastFetched } = req.query;
        
        let query = {};
        
        if (lastFetched) {
            const lastFetchedDate = new Date(lastFetched);

            // Validate the timestamp is valid
            if (isNaN(lastFetchedDate.getTime())) {
                return res.status(400).json({
                    error: 'Invalid timestamp format. Please use ISO 8601 format (e.g., "2024-02-17T15:30:00Z")'
                });
            }            

            query.where = {
                updated_at: {
                    [Op.gt]: lastFetchedDate
                }
            };
        }
        
        const minifig_inventory_items = await MinifigureInventoryItem.findAll(query);
        
        res.json(minifig_inventory_items);
    } catch (error) {
        // Add context to the error message
        error.message = `Error fetching minifigure inventory items: ${error.message}`;
        next(error); // Pass the error to the global error handler
    }
});

export const publicRoutes = router;