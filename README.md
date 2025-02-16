# CyberKeyV3

A modern, secure API key management system built with Next.js, Firebase, and TypeScript.

## Features

- 🔐 Secure API key management
- 📊 Balance tracking and usage metrics
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 Google Authentication
- ⚡ Real-time updates
- 🔍 Search and filtering capabilities
- ⚙️ Customizable settings

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CyberKeyV3.git
cd CyberKeyV3
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.local.example`:
```bash
cp .env.local.example .env.local
```

4. Update the `.env.local` file with your Firebase configuration.

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

### Test Structure
- Unit tests for components
- Integration tests for pages
- Mocked Firebase services
- Comprehensive settings page testing

## Development Status

### Phase 1: ✅ Complete
- Basic application setup
- Google authentication
- Protected routes

### Phase 2: ✅ Complete
- Secure storage implementation
- API key encryption
- Balance management

### Phase 3: ✅ Complete
- Dashboard layout
- API key management UI
- Settings panel
- Search and filtering
- Comprehensive testing

### Phase 4: 🚧 In Progress
- Session management
- Activity logging
- Rate limiting

### Phase 5: 📋 Planned
- Performance optimization
- PWA capabilities
- Offline support

## Tech Stack

- Next.js 14
- TypeScript
- Firebase (Auth & Firestore)
- Tailwind CSS
- Jest & React Testing Library

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
