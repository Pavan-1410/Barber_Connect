# BarberConnect 🪒

A full-stack MERN application that connects customers with barbers for easy appointment booking and management.

## 🌟 Features

### For Customers:
- Browse and discover barber shops nearby
- View detailed barber profiles with services and pricing
- Book appointments with preferred barbers
- Manage appointment history
- Real-time appointment status updates

### For Barbers:
- Create and manage business profiles
- Add and manage services with pricing
- View customer profiles and appointment history
- Manage appointment bookings
- Track earnings and business statistics

## 🛠️ Tech Stack

### Frontend:
- **React.js** - User interface
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icons

### Backend:
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/barberconnect.git
   cd barberconnect
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # Start frontend (from frontend directory)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
barberconnect/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── App.js
│   └── package.json
├── .gitignore
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Barbers
- `GET /api/barbers` - Get all barbers
- `GET /api/barbers/:id` - Get single barber
- `POST /api/barbers` - Create barber profile
- `PUT /api/barbers/:id` - Update barber profile
- `PUT /api/barbers/:id/services` - Update services
- `GET /api/barbers/profile/me` - Get own profile

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Add environment variables for API URL

3. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`

### Backend Deployment (Render/Railway)

1. **Prepare for deployment**
   - Ensure all environment variables are set
   - Update MongoDB connection to production database

2. **Deploy to Render**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables

3. **Deploy to Railway**
   - Connect your GitHub repository
   - Set start command: `npm start`
   - Add environment variables

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/barberconnect
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### Frontend (for production)
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Your Name - [your-email@example.com]

## 🙏 Acknowledgments

- React.js community
- Tailwind CSS team
- MongoDB Atlas for database hosting 