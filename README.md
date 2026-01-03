# Currency Converter

A modern, browser-based currency converter application that allows you to convert one source currency to multiple target currencies (up to 10) simultaneously. Supports both cryptocurrency and fiat currencies with real-time exchange rates.

## Features

- **One-to-Many Conversion**: Convert a single source currency to up to 10 target currencies at once
- **Crypto & Fiat Support**: Mix and match cryptocurrencies (Bitcoin, Ethereum, etc.) with fiat currencies (USD, EUR, GBP, etc.)
- **Real-time Exchange Rates**: Powered by CoinGecko API
- **Auto-refresh**: Exchange rates automatically update every 60 seconds
- **Persistent State**: Your currency selections and amounts are saved to localStorage
- **Search & Filter**: Easily find currencies with the built-in search functionality
- **Swap Functionality**: Quickly swap any target currency with the source
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Lucide Vue** - Beautiful icon library
- **CoinGecko API** - Real-time cryptocurrency and fiat exchange rates

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone or navigate to the repository:
```bash
cd currency-converter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Select Source Currency**: Click on the source currency field to choose your base currency
2. **Enter Amount**: Input the amount you want to convert
3. **Add Target Currencies**: Click the "+ Add Currency" button to add target currencies
4. **View Conversions**: See real-time conversion results for all target currencies
5. **Swap Currencies**: Click the swap icon on any target currency to make it the new source
6. **Remove Currencies**: Click the trash icon to remove a target currency
7. **Refresh Rates**: Click the refresh button in the header or wait for automatic updates

## API Rate Limits

This application uses the free tier of the CoinGecko API, which has rate limits. If you experience issues with rate limiting, consider:

- Reducing the frequency of manual refreshes
- Increasing the auto-refresh interval
- Using a CoinGecko API key (requires code modification)

## Project Structure

```
src/
├── components/           # Vue components
│   ├── CurrencySelector.vue       # Modal for selecting currencies
│   ├── SourceCurrencyInput.vue    # Source currency and amount input
│   ├── TargetCurrencyList.vue     # List of target currencies
│   └── TargetCurrencyItem.vue     # Individual target currency item
├── composables/         # Reusable composition functions
│   ├── useCurrencyAPI.ts          # CoinGecko API integration
│   ├── useConverter.ts            # Main converter logic
│   └── useLocalStorage.ts         # localStorage persistence
├── types/              # TypeScript type definitions
│   └── currency.ts
├── utils/              # Helper functions
│   └── formatters.ts
├── App.vue            # Main application component
├── main.ts           # Application entry point
└── style.css         # Global styles (Tailwind imports)
```

## Features in Detail

### One-to-Many Conversion
Unlike traditional converters that only convert between two currencies, this app allows you to see conversions for multiple target currencies simultaneously, making it perfect for travelers, traders, or anyone working with multiple currencies.

### Persistent State
Your selections are automatically saved to browser localStorage, so when you return to the app, your previously selected currencies and amounts are restored.

### Auto-refresh
Exchange rates are automatically refreshed every 60 seconds to ensure you always have up-to-date information. You can also manually refresh at any time.

### Search & Filter
The currency selector includes a powerful search feature that filters by currency code, symbol, or name. Currencies are also categorized (Popular, Crypto, Fiat) for easy navigation.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Exchange rate data provided by [CoinGecko API](https://www.coingecko.com/en/api)
- Icons by [Lucide](https://lucide.dev/)
