# Instrument Face Assets

This folder is expected to contain realistic instrument face images for the
cockpit trainer gauges.

Recommended filenames (place your PNG/SVG assets here):

- `airspeed.png` – Airspeed Indicator face
- `attitude.png` – Attitude Indicator face
- `altimeter.png` – Altimeter face
- `heading.png` – Heading Indicator / Directional Gyro
- `vsi.png` – Vertical Speed Indicator
- `turn.png` – Turn Coordinator

The React components import these files via:

```js
import airspeedImg from "../../assets/instruments/airspeed.png";
```

You can replace these with your own artwork. Keep square images (e.g. 512x512)
for best results.

