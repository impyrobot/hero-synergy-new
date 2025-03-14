# Hero Synergy Dashboard

A Next.js dashboard application that analyzes and visualizes hero synergies in a game. The dashboard displays hero combination statistics, including win rates, expected performance, and synergy scores.

## Features

- Dynamic calculation of hero synergies based on individual win rates
- Visualization of top and worst synergistic hero combinations
- Comparison of expected vs. actual win rates
- Statistical analysis including average synergy, standard deviation, and more
- Interactive charts with detailed tooltips
- Responsive design with Tailwind CSS

## Tech Stack

- Next.js 14
- TypeScript
- Recharts for data visualization
- Tailwind CSS for styling

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd hero-synergy-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard.

## Project Structure

- `/components` - React components including the main dashboard
- `/utils` - Utility functions for synergy calculations
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Data Sources

The dashboard uses two main data sources:
1. Individual hero win rates and pick rates
2. Hero combination statistics including:
   - Win rates
   - Total matches
   - Kills, deaths, and assists

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 