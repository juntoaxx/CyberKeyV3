# CyberKey V3

A secure and modern API key management system built with Next.js and Firebase, featuring a beautiful UI and desktop deployment capabilities.

## Features

### Core Functionality
- 🔑 Secure API key management with encryption
- 💰 Manual balance tracking and management
- ⏰ Automatic key expiration management
- 📝 Balance history tracking
- 🔔 Comprehensive notification system

### Security & User Experience
- 🔒 Google Authentication integration
- 🌓 Dark/Light theme support
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔐 Secure key storage and display
- 📊 Dashboard for key management

### Advanced Features
- 📧 SMTP email notification configuration
- 🔍 Key status monitoring
- 🔄 Automatic cleanup of expired keys
- 💼 Multi-provider support
- 🔗 Custom funding link support

## Technology Stack

- **Frontend**: Next.js 13+, TypeScript, TailwindCSS
- **Backend**: Firebase (Auth & Firestore)
- **Desktop**: Tauri (Rust-based desktop framework)
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Notifications**: Custom SMTP integration

## Prerequisites

Before you begin, ensure you have installed:
1. Node.js (v16.8 or higher)
2. Git
3. For desktop deployment:
   - Rust (from https://rustup.rs/)
   - Microsoft Visual Studio C++ Build Tools
   - WebView2 Runtime

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

3. Set up Firebase
- Create a new Firebase project
- Enable Authentication (Google provider)
- Enable Firestore Database
- Get your Firebase configuration

4. Configure environment variables
```bash
cp .env.local.example .env.local
```

Add your Firebase configuration to .env.local:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server
```bash
npm run dev
```

## Desktop Deployment Guide

### 1. Install Prerequisites

#### Windows
1. Install Rust:
   - Download from https://rustup.rs/
   - Run rustup-init.exe
   - Choose default installation options

2. Install Visual Studio Build Tools:
   - Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Select "Desktop development with C++"
   - Ensure Windows SDK is included

3. Install WebView2 Runtime:
   - Usually pre-installed on Windows 10/11
   - If needed, download from Microsoft's website

### 2. Add Tauri to the Project

1. Install Tauri CLI and dependencies:
```bash
npm install -D @tauri-apps/cli @tauri-apps/api
```

2. Initialize Tauri:
```bash
npm run tauri init
```

3. Configure your package.json:
```json
{
  "scripts": {
    "tauri": "tauri",
    "desktop:dev": "tauri dev",
    "desktop:build": "tauri build"
  }
}
```

### 3. Build the Desktop Application

1. Development build:
```bash
npm run desktop:dev
```

2. Production build:
```bash
npm run desktop:build
```

The built application will be in `src-tauri/target/release`.

## Project Structure

```
src/
├── app/            # Next.js 13+ app directory
│   ├── api/        # API routes
│   ├── dashboard/  # Dashboard pages
│   └── settings/   # Settings pages
├── components/     # React components
│   ├── layout/     # Layout components
│   ├── settings/   # Settings components
│   └── ui/         # UI components
├── contexts/       # React contexts
├── lib/           # Core libraries
│   └── firebase.ts # Firebase configuration
├── services/      # Service layer
└── types/         # TypeScript types
```

## Key Features Guide

### API Key Management
- Create new API keys with custom names and providers
- Set expiration dates for keys
- Manually track and update key balances
- Store balance history
- Automatic cleanup of expired keys

### Notification System
- Email notifications for expiring keys
- Custom SMTP server configuration
- Low balance alerts based on manual thresholds
- Browser notifications

### Theme Support
- System/Light/Dark mode support
- Persistent theme preferences
- Automatic system theme detection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
