# CoalSure

> Smart governance for safer mines.

CoalSure is a single-page HTML prototype for digital governance across India's coal-mining ecosystem. It provides a unified operational view for compliance, inspections, contractor oversight, alerts, and mine-risk intelligence.

## Features

- Role-based login prototype for field officers, mine officials, corporate administrators, and regulators
- Dashboard with mine, inspection, compliance, and risk summaries
- Mine risk map with operational risk indicators
- Inspection log and new-inspection workflow
- Compliance deadline tracker
- Contractor management view
- Alerts and notifications center
- AI risk insights with interactive charts
- Responsive layout for desktop, tablet, and mobile screens

## Tech stack

- HTML5
- CSS3 with responsive media queries
- Vanilla JavaScript
- [Lucide](https://lucide.dev/) icons via CDN
- [Chart.js](https://www.chartjs.org/) via CDN
- Google Fonts: DM Sans and IBM Plex Sans

## Getting started

No build process or package installation is required.

1. Clone the repository:

   ```bash
   git clone https://github.com/Badmashstewie/SIH_2026.git
   cd SIH_2026
   ```

2. Open `index.html` directly in a browser, or start a local server:

   ```bash
   python3 -m http.server 8000
   ```

3. Visit [http://localhost:8000](http://localhost:8000).

The login screen is part of the prototype only. Submit the form with any valid-looking email address and password to enter the console; no authentication service is connected.

## Project structure

```text
SIH_2026/
├── index.html   # Complete CoalSure prototype: markup, styles, and JavaScript
└── README.md    # Project documentation
```

## Usage

After entering the console, use the sidebar to navigate between the dashboard, risk map, inspection log, compliance tracker, contractor management, alerts, and AI insights. The inspection form and dashboard actions demonstrate front-end interactions using sample data.

## Data and security disclaimer

This repository contains a front-end demonstration with mock data. It does not connect to government systems, mine databases, authentication providers, or production APIs. Do not enter real credentials or sensitive operational information.

External fonts and JavaScript libraries are loaded from public CDNs, so an internet connection may be required for icons, fonts, and charts to render correctly.

## Contributing

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make and test your changes in a modern browser.
4. Commit your changes and open a pull request.

## License

No license has been specified for this repository yet. Contact the repository owner before redistributing or using the project in production.
