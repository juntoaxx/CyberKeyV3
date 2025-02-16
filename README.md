# CyberKey V3

A secure and modern API key management system built with Next.js and Firebase.

## Features

- Secure API key management
- Activity logging and monitoring
- User authentication
- Real-time updates
- Comprehensive test coverage

## Technology Stack

- Next.js 13+
- TypeScript
- Firebase (Auth & Firestore)
- TailwindCSS
- Jest & React Testing Library

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/CyberKeyV3.git
cd CyberKeyV3
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase configuration
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

The project uses Jest and React Testing Library for testing. Run tests with:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- activity-log-service.test.ts
```

### Test Coverage

Current test coverage focuses on:
- Activity logging service
- User authentication
- API key management

## Project Structure

```
src/
├── components/     # React components
├── lib/
│   ├── services/  # Core services
│   └── utils/     # Utility functions
├── pages/         # Next.js pages
└── styles/        # Global styles
```

## Development Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Use TailwindCSS for styling
- Document API changes
- Keep components small and focused

## Recent Updates

- Added comprehensive activity logging service
- Implemented test suite for activity logging
- Improved error handling in core services
- Enhanced type safety across the application

## License

[MIT](LICENSE)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
