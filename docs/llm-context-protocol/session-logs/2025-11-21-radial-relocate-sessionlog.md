# Session Log: Radial Relocation
**Date:** November 21, 2025
**Session Duration:** ~30m
**Main Objectives:** Move the Harmonic Radial Dial from `_radial` into `src/radial` so the project tree keeps everything under `src`.

---

## Work Completed

- Created `src/radial`, moved `ApparatusCircleGenerator.jsx` plus the entire `apparatus/` folder inside it, and deleted the now-empty `_radial` folder.
- Updated `App.jsx` to import from `src/radial/ApparatusCircleGenerator` and adjusted `WavyCircleControls` to import atoms relative to the new location.
- Verified the build still passes after the move (`yarn build`).

## Testing

- `yarn build`
