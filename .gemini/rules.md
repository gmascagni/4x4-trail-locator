# 4x4 TrailFinder - Core Architectural Principles & Memory

## 1. Dynamic Nationwide Design (All 50 States)
- **Universal Example Principle**: Any specific state name, trail name, or shop name mentioned by the user (e.g., *"North Carolina"*, *"Moab"*, *"Tray Mountain"*, *"Whissenhunt"*) is an **illustrative example representing the broader system**.
- **No Static/Single-State Hardcoding**: All implementations must be built universally and dynamically to support all 50 US states and any GPS coordinate.
- **Dynamic State Boundaries**: State searches must pull from the official GeoJSON boundary dataset to outline the true geographic borders dynamically for whichever state is queried.
- **Live Geodesic Distance Calculation**: All mileage badges, drive hours, and radius filters must calculate dynamically from the user's active GPS coordinates in real-time.
