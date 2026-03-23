# GigMatrix 🚀

A modern, full-stack freelance marketplace connecting talented freelancers with amazing projects worldwide.

![GigMatrix](https://img.shields.io/badge/GigMatrix-v1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Email verification with OTP system
- Real email delivery via Gmail SMTP
- Role-based access control (Client/Freelancer)
- Content Security Policy (CSP) compliant

### 💼 Job Management
- Complete CRUD operations for job postings
- Job browsing with search and filter functionality
- Application system with accept/reject workflow
- Real-time status updates
- Budget and deadline management

### 👥 User Profiles
- Profile picture upload and management
- Skills management for freelancers
- Bio and contact information
- Professional profile display

### 💬 Real-time Messaging
- WebSocket-based instant messaging
- Job-specific conversation rooms
- Typing indicators
- Message persistence with MongoDB
- Real-time message delivery

### 🎨 Modern UI/UX
- Glassmorphism design with smooth animations
- Responsive layout for all devices
- Professional color schemes
- Clean, intuitive navigation
- Optimized font hierarchy (Open Sans, Roboto, Lato)

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Modern ORM for database management
- **MongoDB Atlas** - Cloud database
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Secure authentication
- **Nodemailer** - Email service

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Socket.IO Client** - Real-time messaging
- **Modern CSS** - Glassmorphism and animations
- **Font Awesome** - Icon library

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account for email service (with App Password)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gigmatrix.git
cd gigmatrix
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# MongoDB Database URL
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/gigmatrix?retryWrites=true&w=majority"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg

# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000
```

4. **Set up Prisma**
```bash
npx prisma generate
npx prisma db push
```

5. **Start the server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
gigmatrix/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── css/                   # Stylesheets
│   ├── js/
│   │   ├── api.js            # API service layer
│   │   ├── main.js           # Main application logic
│   │   └── socket.io.min.js  # Socket.IO client
│   ├── uploads/              # User uploaded files
│   └── index.html            # Main HTML file
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── services/             # Business logic
│   │   ├── emailService.js
│   │   ├── uploadService.js
│   │   └── websocketService.js
│   └── utils/                # Utility functions
│       ├── helpers.js
│       └── logger.js
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
├── server.js                # Application entry point
└── README.md                # This file
```

## 🔧 Configuration

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password
3. Use the generated password in your `.env` file

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Get your connection string and add it to `.env`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job (Client only)
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job (Client only)
- `DELETE /api/jobs/:id` - Delete job (Client only)
- `POST /api/jobs/:id/apply` - Apply to job (Freelancer only)
- `GET /api/jobs/:id/applications` - Get job applications (Client only)
- `PUT /api/jobs/applications/:id/status` - Update application status

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/job/:jobId` - Get job messages
- `GET /api/messages/conversations` - Get user conversations

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/picture` - Upload profile picture

## 🎯 Usage

### For Clients
1. Register as a Client
2. Verify your email
3. Post job opportunities
4. Review freelancer applications
5. Accept/reject applications
6. Message freelancers in real-time

### For Freelancers
1. Register as a Freelancer
2. Verify your email
3. Add your skills
4. Browse available jobs
5. Apply to jobs with your bid
6. Message clients about projects

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Content Security Policy headers
- Role-based authorization
- Secure file upload handling
- XSS protection
- CSRF protection

## 🚀 Deployment

### Heroku Deployment

1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy:
```bash
git push heroku main
```

### Vercel/Netlify Deployment

For frontend-only deployment, you'll need to set up a separate backend deployment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- MongoDB Atlas for database hosting
- Socket.IO for real-time communication

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

Made with ❤️ by GigMatrix Team
