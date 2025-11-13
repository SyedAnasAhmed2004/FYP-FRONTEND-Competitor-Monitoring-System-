# Strategic Agent - AI Intelligence Platform

A modern, professional React application built with Vite, Ant Design, and React Router v6.

## 🚀 Features

- ⚡️ **Vite** - Lightning-fast build tool and dev server
- ⚛️ **React 18** - Latest React version with concurrent features
- 🎨 **Ant Design 5** - Professional UI component library
- 🔄 **React Router v6** - Modern routing with nested routes
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎯 **Path Aliases** - Clean imports with `@` prefix
- 🔧 **ESLint & Prettier** - Code quality and formatting
- 🌍 **Environment Variables** - Separate dev/prod configurations
- 🚢 **Production Ready** - Optimized builds with code splitting

## 📋 Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd simple-react-antdesign-boilerplate
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   copy .env.example .env.local
   # Edit .env.local with your settings
   ```

## 🎯 Available Scripts

### Development
```bash
npm run dev
# or
npm start
```
Starts the development server at `http://localhost:1500` with hot-reload.

### Build
```bash
npm run build
```
Creates an optimized production build in the `dist` folder.

### Preview Production Build
```bash
npm run preview
```
Preview the production build locally.

### Lint
```bash
npm run lint
```
Check code quality with ESLint.

### Format
```bash
npm run format
```
Format code with Prettier.

## 📁 Project Structure

```
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── MainLayout.js
│   │   └── ProtectedRoute.js
│   ├── config/         # Configuration files
│   │   ├── api.js
│   │   └── routes.js
│   ├── pages/          # Page components
│   │   └── Auth/
│   ├── services/       # API services
│   ├── styles/         # Global styles
│   ├── views/          # Main view components
│   │   ├── Dashboard.js
│   │   ├── About.js
│   │   ├── Table.js
│   │   ├── Config.js
│   │   └── Settings.js
│   ├── App.css         # App styles
│   ├── App.js          # Root component
│   └── main.jsx        # Entry point
├── .env.development    # Development environment variables
├── .env.production     # Production environment variables
├── .eslintrc.json      # ESLint configuration
├── .prettierrc.json    # Prettier configuration
├── index.html          # HTML template
├── jsconfig.json       # JavaScript configuration
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## 🔧 Configuration

### Path Aliases

The project uses path aliases for cleaner imports:

```javascript
import Component from '@/components/Component';
import { api } from '@config/api';
import Dashboard from '@views/Dashboard';
```

Available aliases:
- `@` → `src/`
- `@components` → `src/components/`
- `@pages` → `src/pages/`
- `@views` → `src/views/`
- `@config` → `src/config/`
- `@services` → `src/services/`
- `@assets` → `src/assets/`
- `@styles` → `src/styles/`

### Environment Variables

Use `VITE_` prefix for environment variables:

```env
VITE_APP_TITLE=Strategic Agent
VITE_API_BASE_URL=https://api.example.com
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 🎨 Theming

The app uses Ant Design's ConfigProvider for theming. Customize in `src/App.js`:

```javascript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#E63946',
      // ... other theme tokens
    },
  }}
>
```

## 📱 Routing

The app uses React Router v6 with nested routes:

- `/` - Dashboard (default)
- `/table` - Competitors Table
- `/about` - AI Assistant
- `/config` - Reports
- `/settings` - Settings
- `/login` - Login Page

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The optimized files will be in the `dist` folder, ready to deploy to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3
- etc.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [React Router](https://reactrouter.com/)
