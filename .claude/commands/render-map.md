Render a debug map image using the worldgen script.

Arguments: $ARGUMENTS (format: `<seed> [tile-px]`, e.g. `42 8` or just `42`)

Parse the arguments:
- First argument is the seed (required, default to 1 if missing)
- Second argument is the tile pixel size (optional, default 8)

Run this command (replace `<seed>` and `<tile-px>` with parsed values):
```
node scripts/render-map-debug.js --seed <seed> --tile-px <tile-px> --png
```

After the command completes, read the generated PNG file from the `debug/` directory and show it to the user.
