# ☁️ CloudNest

> **AI-Powered Cloud Storage — Google Drive Clone**  
> Built with React + Node.js + PostgreSQL + Google Gemini AI

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql)
![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-orange?style=for-the-badge)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-red?style=for-the-badge&logo=google)

---

## ✨ Features

- 🔐 **Authentication** — Register/Login with JWT + bcrypt
- 📁 **File Upload** — Images, PDFs, Videos, Docs (up to 50MB)
- 📂 **Folders** — Create, organize, nested folders
- ⭐ **Star Files** — Mark important files
- 🗑️ **Trash** — Soft delete + restore
- 🔗 **Share Links** — Public shareable URLs
- 🤖 **AI Features** *(Coming Soon)* — Auto-tagging, Smart Search, File Summary powered by Gemini AI
- 📱 **Android App** *(Coming Soon)* — Via Capacitor.js

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite → Next.js |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL (Neon.tech) |
| **ORM** | Prisma |
| **File Storage** | Cloudinary |
| **Authentication** | JWT + bcrypt |
| **AI** | Google Gemini API |
| **Deployment** | Vercel + Railway + Azure |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/pt1499/cloudnest.git
cd cloudnest/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
# .env file banao aur yeh variables add karo:
DATABASE_URL="your_neon_postgresql_url"
JWT_SECRET="your_jwt_secret"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
GEMINI_API_KEY="your_gemini_key"
PORT=5000
```

### 4. Setup database
```bash
npx prisma generate
npx prisma db push
```

### 5. Start server
```bash
node src/index.js
```

Server runs at `http://localhost:5000` ✅

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT token |
| GET | `/api/auth/me` | Get current user (Protected) |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload a file |
| GET | `/api/files` | Get all files |
| DELETE | `/api/files/:id` | Delete a file |
| PATCH | `/api/files/:id/star` | Star/Unstar file |
| PATCH | `/api/files/:id/trash` | Move to trash |

---

## 📁 Project Structure

```
cloudnest/
└── backend/
    ├── src/
    │   ├── controllers/
    │   │   ├── auth.controller.js    # Auth logic
    │   │   └── file.controller.js    # File operations
    │   ├── routes/
    │   │   ├── auth.routes.js        # Auth endpoints
    │   │   └── file.routes.js        # File endpoints
    │   ├── middleware/
    │   │   └── auth.js               # JWT verification
    │   └── utils/
    │       ├── prisma.js             # DB client
    │       ├── cloudinary.js         # Cloudinary config
    │       └── upload.js             # Multer config
    ├── prisma/
    │   └── schema.prisma             # DB schema
    └── .env                          # Environment variables
```

---

## 🗺️ Roadmap

- [x] Phase 1 — Backend + Authentication
- [x] Phase 2 — File Upload API (Cloudinary)
- [ ] Phase 3 — React Frontend
- [ ] Phase 4 — AI Features (Gemini)
- [ ] Phase 5 — Next.js Version
- [ ] Phase 6 — Multi-platform Deploy (Vercel + Railway + Azure)
- [ ] Bonus — Android App (Capacitor.js → Play Store)

---

## 👨‍💻 Author

**Prashant Tewari**  
Senior eLearning Developer → Full Stack Developer  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://linkedin.com/in/prashant-tewari-8125015a)

---

## 📄 License

MIT License — feel free to use this project for learning!
