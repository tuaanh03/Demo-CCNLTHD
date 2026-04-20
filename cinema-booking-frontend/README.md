# Cinema Booking Frontend

This is the frontend application for the Cinema Booking system, built with React, TypeScript, and Material-UI.

## Features

- View list of available movies
- Select seats for a movie
- Book tickets with customer information
- View booking confirmation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on http://localhost:8080

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cinema-booking-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000.

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── services/       # API services
├── types/          # TypeScript interfaces
└── App.tsx         # Main application component
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs the test suite
- `npm eject`: Ejects from Create React App

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
