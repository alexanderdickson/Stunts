Stunts
======

A TypeScript / WebGL implementation of the classic DOS stunt-driving game.

## Features

- Loads original Stunts `.TRK` track files
- Renders track tiles from the classic 3D object library
- Drivable car with arcade physics
- Chase and hood camera modes
- Horizon backgrounds from the original game themes

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Accelerate |
| S / ↓ | Brake / reverse |
| A / ← | Steer left |
| D / → | Steer right |
| R | Reset to start line |
| C | Toggle chase / hood camera |

## Build

```bash
npm run build
npm run preview
```

## Project Layout

- `src/` — TypeScript game source
- `objs/trk/` — Stunts track object models (OBJ/MTL)
- `trks/` — Track files (binary `.TRK` format)
- `texs/horizon/` — Sky/horizon backdrop images
- `js/` — Legacy JavaScript prototype (kept for reference)

## Track Format

See the [original Stunts track format documentation](http://www.ultimatestunts.nl/documentation/en/originaltrackformat.htm).

## Status

This is a work in progress. Track rendering covers most tile types from the original editor. Physics are simplified compared to the DOS original — loops, pipes, and advanced stunts are visual only for now.
