import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

import { rebrickableService } from '../services/rebrickableService.js';

// Helpers to use __dirname and __filename like in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Provides a robust path resolution relative to src (no need to prepend src to the outputPath in the config)
function resolveFromSrc(p) {
  return path.isAbsolute(p) ? p : path.resolve(path.join(__dirname, '..'), p);
}

// Config loader & validator
async function loadGenerateInvItemsConfig() {
  const configPath = path.join(__dirname, 'generate-inv-items-config.json'); // Default co-located file

  const raw = await fs.readFile(configPath, 'utf8');
  const config = JSON.parse(raw);

  // Validate the config
  const required = ['setNumSeriesBase', 'countInSeries', 'positionToMinifigureId', 'outputPath'];
  for (const key of required) {
    if (!(key in config)) throw new Error(`Config missing "${key}"`);
  }
  if (typeof config.setNumSeriesBase !== 'string') {
    throw new Error('Config "setNumSeriesBase" must be a string like "71050"');
  }
  if (!Number.isInteger(config.countInSeries)) {
    throw new Error('Config "countInSeries" must be a an integer');
  }
  if (typeof config.positionToMinifigureId !== 'object' || config.positionToMinifigureId === null) {
    throw new Error('Config "positionToMinifigureId" must be an object mapping positions to minifigureIds"');
  }
  for (const [k, v] of Object.entries(config.positionToMinifigureId)) {
    // Note that keys in JSON are always strings
    if (!Number.isInteger(Number(k))) {
      throw new Error(`Invalid key "${k}", must be an integer string`);
    }
    if (!Number.isInteger(v)) {
      throw new Error(`Invalid value "${v}", must be an integer`);
    }
  }

  // Note that an error is thrown if outputPath isn't a string
  config.outputPath = resolveFromSrc(config.outputPath);

  return config;
}

// Fetch all the inventory items of a minifigure using the minifigure's setNum.
async function fetchMinifigureInventoryItems(setNum) {
  try {
    const response = await rebrickableService.getMinifigureInventory(setNum);
    return response;
  } catch (err) {
    console.error(`❌ Failed to fetch the inventory items for the minifigure with setNum ${setNum}}:`, err.message);
  }
}

// Transform the inventory items in order to insert them in the database
function transformRebrickableInventoryItems(items, setNum, minifigureId) {
  return items
    .filter(item => !item.is_spare)
    .map(item => ({
      name: item.part.name,
      image_url: item.part.part_img_url,
      part_url: item.part.part_url,
      quantity: item.quantity,
      type: item.set_num.startsWith("fig") ? "Part" : "Accessory", // Non-urgent: "Accessory" may not be an accurate term. A more accurate term or phrase would be "Other/Alternative Part" or to keep it simple, just "Other." If this is done maybe "Part" should also be renamed to "Minifigure Part"
      set_num: setNum, // You can think of this as a rebrickable minifigureId. Note that setting this to item.set_num won't work because some of the set_nums start with the fig prefix like "fig-016715" 
      minifigure_id: minifigureId,
      rebrickable_id: item.id,
      last_updated_rebrickable: new Date().toISOString()
    }));
}

async function main() {
  const config = await loadGenerateInvItemsConfig()

  // console.log(config)

  const tasks = Array.from(
    { length: config.countInSeries }, // Creates a new array of length 12 (filled with undefined)
    (_, i) => ({ // The mapping function called 12 times
      setNum: `${config.setNumSeriesBase}-${i + 1}`,
      minifigureId: config.positionToMinifigureId[i + 1]
    })
  );

  // console.log(tasks)

  const seriesInventoryItems = [];

  for (const task of tasks) {
    const response = await fetchMinifigureInventoryItems(task.setNum);
    const minifigureInventoryItems = transformRebrickableInventoryItems(response.results, task.setNum, task.minifigureId);
    // console.log(minifigureInventoryItems)
    seriesInventoryItems.push(...minifigureInventoryItems) // Spread to keep the array flat. Note that the spread operator expands the array elements into individual arguments for push.
    // console.log(seriesInventoryItems)
  }

  await fs.mkdir(path.dirname(config.outputPath), { recursive: true });
  await fs.writeFile(config.outputPath, JSON.stringify(seriesInventoryItems, null, 2), 'utf8');

  console.log(`✅ Wrote ${seriesInventoryItems.length} items to ${config.outputPath}`);
}

// Run the script
await main().catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
})