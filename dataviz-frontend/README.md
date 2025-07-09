# DataViz Dashboard Frontend

A modern, responsive data visualization dashboard built with Angular 19, Tailwind CSS, and AmCharts.

## 🚀 Features

- **Modern Angular 19** - Built with the latest Angular features and standalone components
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Interactive Charts** - Powered by AmCharts for beautiful data visualization
- **Dark Mode Support** - Built-in dark/light theme switching
- **Real-time Data** - Live data updates and streaming capabilities
- **Modular Architecture** - Clean, maintainable code structure
- **TypeScript** - Full type safety and better development experience

## 📊 Dashboard Features

### Core Components
- **Dashboard Overview** - Main dashboard with key metrics and charts
- **Advanced Charts** - Interactive chart gallery with multiple chart types
- **Analytics** - Data analysis and insights with detailed metrics
- **Real-time Updates** - Live data streaming and updates
- **Filtering & Search** - Advanced filtering capabilities
- **Export Functionality** - Chart and data export options

### Chart Types
- Line Charts
- Bar Charts
- Pie Charts
- Area Charts
- Scatter Plots
- Geographic Maps
- Time Series Charts
- Heatmaps

## 🛠️ Technology Stack

- **Frontend Framework**: Angular 19
- **Styling**: Tailwind CSS
- **Charts**: AmCharts 5
- **UI Components**: Angular Material
- **State Management**: RxJS
- **Build Tool**: Angular CLI
- **Package Manager**: npm

## 📁 Project Structure

```
dataviz-frontend/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── dashboard/
│   │   │   ├── charts/
│   │   │   └── analytics/
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── @dataviz/
│   │   ├── services/
│   │   │   ├── config/
│   │   │   ├── loading/
│   │   │   ├── confirmation/
│   │   │   ├── media-watcher/
│   │   │   ├── platform/
│   │   │   ├── splash-screen/
│   │   │   └── utils/
│   │   └── dataviz.provider.ts
│   ├── styles/
│   │   ├── styles.scss
│   │   ├── tailwind.scss
│   │   └── vendors.scss
│   ├── environments/
│   └── main.ts
├── public/
├── angular.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Angular CLI (v19)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dataviz-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🎨 Customization

### Themes
The dashboard supports multiple themes:
- Default (Light)
- Brand
- Teal
- Dark
- Navy

### Colors
The color scheme is defined in `tailwind.config.js`:
- Primary: Blue shades
- Accent: Green shades
- Warning: Red shades
- Dark: Gray shades

### Charts
Charts are configured using AmCharts 5. You can customize:
- Chart types and configurations
- Colors and styling
- Animations and interactions
- Data sources and APIs

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1366px+)
- Tablet (768px+)
- Mobile (320px+)

## 🔧 Development

### Adding New Components

1. Create a new component in the appropriate module
2. Add routing in `app.routes.ts`
3. Import and use the component

### Adding New Services

1. Create a new service in `@dataviz/services/`
2. Add to the provider configuration
3. Inject and use in components

### Styling

- Use Tailwind CSS classes for styling
- Custom styles in `styles.scss`
- Component-specific styles in component files

## 📊 Data Integration

### API Integration
The dashboard is designed to work with various data sources:
- REST APIs
- GraphQL
- WebSocket connections
- Real-time data streams

### Chart Data
Charts accept data in various formats:
- JSON arrays
- CSV data
- Time series data
- Geographic data

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e
```

## 📦 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Various Platforms
- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your GitHub repository
- **Firebase**: Use Firebase Hosting
- **AWS S3**: Upload to S3 bucket

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Updates

To update the project:
```bash
npm update
ng update @angular/cli @angular/core
```

## 📈 Performance

The dashboard is optimized for:
- Fast loading times
- Smooth animations
- Efficient data rendering
- Mobile performance
- SEO optimization

## 🔒 Security

- HTTPS enforcement
- XSS protection
- CSRF protection
- Input validation
- Secure data transmission

---

**Built with ❤️ using Angular 19 and modern web technologies** 