# 📈 CapitalView - Stock Portfolio Management Platform

A modern, responsive web application for managing investment portfolios and tracking stock market data. Built with React, Supabase, and Tailwind CSS.

![CapitalView Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.75.1-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-blue)

## ✨ Features

### 🏠 **Dashboard**
- Modern gradient hero section with welcome message
- Portfolio overview with key statistics
- Quick access to portfolio management
- Real-time data visualization
- Responsive grid layout

### 📊 **Portfolio Management**
- Create and manage multiple portfolios
- Add stocks with purchase details (date, quantity, price)
- View portfolio performance metrics
- Track invested value and market value
- Interactive portfolio selection sidebar

### 🔍 **Stock Browser**
- Browse comprehensive stock database
- Advanced search functionality by symbol or company name
- Detailed stock information (OHLC data, volume)
- Modern card-based layout with hover effects
- Pagination for easy navigation

### 🔐 **Authentication**
- Google OAuth integration via Supabase
- Secure user session management
- Modern login interface with animated background

### 🎨 **Modern UI/UX**
- Beautiful blue gradient theme
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive navigation with icons
- Professional color scheme

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rishirxt/StocksPortfolio.git
   cd StocksPortfolio
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the `frontend` directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## 🏗️ Project Structure

```
StocksPortfolio/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation component
│   │   │   └── ui/                 # Reusable UI components
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Dashboard page
│   │   │   ├── Portfolio.jsx       # Portfolio management
│   │   │   ├── BrowseStocks.jsx    # Stock browser
│   │   │   └── Login.jsx           # Authentication
│   │   ├── supabaseClient.js       # Supabase configuration
│   │   └── index.css               # Global styles
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - Modern UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Radix UI** - Accessible component primitives

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Row Level Security** - Data protection

### Development Tools
- **Create React App** - Development environment
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes


## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
REACT_APP_SUPABASE_URL=your_production_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Rishi** - [GitHub](https://github.com/Rishirxt)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the UI framework
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the author
- Check the documentation

---

⭐ **Star this repository if you found it helpful!**
