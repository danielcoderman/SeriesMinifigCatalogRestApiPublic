# Series and Minifigure Catalog REST API

A REST API backend for the Tracker for Minifigures Series Android app, built with Node.js, Express, PostgreSQL, and Sequelize.

This repository is a public, read-only snapshot of the production backend and is no longer actively maintained.

## Related Project

- **[Tracker for Minifigures Series (Android App)](https://github.com/danielcoderman/TrackerForMinifiguresSeriesPublic)**  
  This REST API powers the Android application.

## Purpose

This service provided structured LEGO minifigure data — including series, minifigures, and associated inventory items — to the Android client.

The API supports incremental synchronization, allowing the Android app to fetch only records modified since a given timestamp. This reduces unnecessary data transfer and improves synchronization efficiency.

---

## Tech Stack

- Node.js (ES Modules)
- Express
- PostgreSQL (hosted via Supabase)
- Sequelize
  - ORM for modeling domain entities
  - Schema migrations
  - Transactional seeders
- Security & reliability:
  - Helmet
  - express-rate-limit
  - Morgan (custom client IP handling for proxy / edge environments)

## API Overview

All API endpoints are prefixed with `/api`.

### Endpoints

- `GET /api/series`
- `GET /api/minifigures`
- `GET /api/minifigure-inventory-items`

### Incremental Synchronization

Each endpoint optionally accepts:

```
?lastFetched=<ISO-8601 timestamp>
```

When provided, results include only records where:

```
updated_at > lastFetched
```

If an invalid timestamp is supplied, the API returns `400 Bad Request`.

### Example Responses

`GET /api/series`

```json
[
  {
    "id": 48,
    "name": "Spider-Man: Across the Spider-Verse",
    "image_url": "https://example.com/image.png",
    "num_of_minifigs": 12,
    "release_date": "2025-09-01"
  },
  ...
]
```

`GET /api/minifigures`

```json
[
  {
    "id": 728,
    "name": "Miles Morales/Spider-Man",
    "image_url": "https://cdn.example.com/image.jpg",
    "position_in_series": 1,
    "series_id": 48,
    "inventory_size": 6
  },
  {
    "id": 729,
    "name": "Hobie Brown/Spider-Punk",
    "image_url": "https://cdn.example.com/image.jpg",
    "position_in_series": 2,
    "series_id": 48,
    "inventory_size": 7
  },
  ...
]
```

`GET /api/minifigure-inventory-items`

```json
[
  {
    "id": 5329,
    "name": "Insect, Spider with Elongated Tail Section",
    "image_url": "https://cdn.example.com/image.jpg",
    "part_url": "https://rebrickable.com/parts/example-part-info",
    "minifigure_id": 728,
    "quantity": 1,
    "type": "Accessory",
    "set_num": "71050-1",
    "rebrickable_id": 32800014
  },
  {
    "id": 5330,
    "name": "Hair Coiled and Short, Squared Front",
    "image_url": "https://cdn.example.com/image.jpg",
    "part_url": "https://rebrickable.com/parts/example-part-info",
    "minifigure_id": 728,
    "quantity": 1,
    "type": "Part",
    "set_num": "71050-1",
    "rebrickable_id": 32800021
  },
  ...
]
```

## Rate Limiting & Security

Public API routes under `/api` are protected with rate limiting and secure HTTP headers.

Rate limiting:
- 100 requests per 15-minute window
- Enforced per client IP
- Uses a best-effort client IP strategy that prefers trusted edge headers (e.g., Cloudflare) when present
- Standard `RateLimit-*` headers are returned in responses.

Security headers are applied via Helmet.

---

## Database Schema

The database models three core domain entities, each backed by a PostgreSQL table and a Sequelize model:

* `series`
* `minifigure`
* `minifigure_inventory_item`

The database is implemented in PostgreSQL (hosted via Supabase) and managed through Sequelize migrations.

Unless otherwise specified, columns are defined as `NOT NULL`.

All tables include `created_at` and `updated_at` timestamps.
`created_at` is set on insertion, and `updated_at` is automatically updated via a database trigger, enabling incremental synchronization.

### `series`

| Column          | Type        | Notes                           |
| --------------- | ----------- | ------------------------------- |
| id              | serial      | Primary key                     |
| name            | varchar     | Series name                     |
| image_url       | text        | Series image URL                |
| num_of_minifigs | smallint    | Total minifigures in the series |
| release_date    | text        | Release date                    |
| created_at      | timestamptz | Set on insertion                |
| updated_at      | timestamptz | Updated via database trigger    |

Constraints:

* `image_url` is unique

### `minifigure`

| Column             | Type        | Notes                        |
| ------------------ | ----------- | ---------------------------- |
| id                 | serial      | Primary key                  |
| name               | varchar     | Minifigure name              |
| image_url          | text        | Minifigure image URL         |
| position_in_series | smallint    | Position within the series   |
| series_id          | integer     | FK → `series.id`             |
| inventory_size     | smallint    | Total unique inventory items |
| created_at         | timestamptz | Set on insertion             |
| updated_at         | timestamptz | Updated via database trigger |

Constraints:

* `image_url` is unique
* `series_id` references `series(id)` with cascading updates and deletes

### `minifigure_inventory_item`

| Column                   | Type        | Notes                            |
| ------------------------ | ----------- | -------------------------------- |
| id                       | serial      | Primary key                      |
| name                     | varchar     | Item name                        |
| image_url                | text        | Item image URL                   |
| part_url                 | text        | External item reference          |
| minifigure_id            | integer     | FK → `minifigure.id`             |
| quantity                 | smallint    | Quantity required                |
| type                     | text        | Either `Part` or `Accessory`     |
| set_num                  | text        | Rebrickable set number           |
| rebrickable_id           | integer     | Rebrickable inventory part ID    |
| last_updated_rebrickable | timestamptz | Last update from Rebrickable API |
| created_at               | timestamptz | Set on insertion                 |
| updated_at               | timestamptz | Updated via database trigger     |

Constraints:

* `rebrickable_id` is unique
* `type` is restricted to `Part` or `Accessory`
* `minifigure_id` references `minifigure(id)` with cascading updates and deletes

## Sequelize Models

Each table is represented by a Sequelize model, providing:

* Structured definitions of domain entities
* Relationship mapping
* Constraint enforcement
* Simplified querying within route handlers

This maintains a clean separation between database structure and application logic.

## Migrations

Schema evolution is managed through Sequelize migrations.

Key migrations:

* Creation of core tables
* Creation of reusable `update_updated_at_column` function
* Triggers to automatically maintain `updated_at`
* Rename of `minifigure_inventory` to `minifigure_inventory_item`
* Addition and backfill of `inventory_size` on `minifigure`

## Seeders & Transactional Data Insertion

Data population is handled through Sequelize seeders executed within database transactions.

For each new series:

1. Insert series
2. Insert related minifigures
3. Insert inventory items

If any step fails, the entire transaction rolls back, preventing partial data from being exposed to clients.

## Data Generation Utilities

The repository includes utilities used to generate inventory data prior to insertion.

### `rebrickableService.js`

Encapsulates communication with the Rebrickable API and retrieves raw inventory data.

### `generateSeriesInventoryItemsJson.js`

Uses `rebrickableService.js` to generate inventory JSON for all minifigures in a given series.

### `generate-inv-items-config.json`

Configuration file defining which series and minifigures should be processed.

Generated JSON is manually reviewed to remove unnecessary parts (e.g., base plates) before being inserted via seeders.

## Configuration

The service relies on environment variables for:

* Database connectivity
* Rebrickable API access

A `.env.example` file documents required variables.
No real credentials are included in this snapshot.

## License

MIT (see `LICENSE`).