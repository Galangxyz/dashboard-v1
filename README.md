# InternHub - Firebase-Powered Dashboard

A NeoBrutalism-styled dashboard for monitoring mahasiswa magang (internship students), built with React, Tailwind CSS, and Firebase.

## Tech Stack
- React + Vite
- Tailwind CSS (NeoBrutalism theme)
- Firebase Authentication (Google Login)
- Firestore Database
- Firebase Storage
- Recharts
- Lucide React
- React Helmet Async

## Quick Start

### 1. Create a new React Vite project
```bash
npm create vite@latest internhub -- --template react
cd internhub
```

### 2. Install dependencies
```bash
npm install firebase react-router-dom react-helmet-async recharts lucide-react tailwindcss-animate clsx tailwind-merge class-variance-authority
npm install -D tailwindcss postcss autoprefixer
```

### 3. Copy files
Copy all files from the `src/` directory into your new project, along with `tailwind.config.js`, `firestore.rules`, and `.env.example`.

### 4. Set up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication > Google Sign-in
4. Create a Firestore Database
5. Enable Storage
6. Get your config from Project Settings → General → Your apps
7. Copy `.env.example` to `.env` and fill in your credentials

### 5. Configure Firestore Security Rules
Copy the contents of `firestore.rules` to your Firestore Rules tab.

### 6. Run
```bash
npm run dev
```

## Admin Setup
- `admin@gmail.com` is automatically assigned the **admin** role
- All other users get the **user** (mahasiswa) role

## Firestore Collections
- `users` - User accounts (uid, name, email, photoURL, role, createdAt)
- `participants` - Student data (nim, namaLengkap, programStudi, angkatan, email, nomorHp)
- `internships` - Placement data (namaPerusahaan, alamat, mentor, tanggalMulai, tanggalSelesai, participantId)
- `attendance` - Attendance records (participantId, tanggal, jamMasuk, jamPulang, status)
- `evaluations` - Mentor evaluations (participantId, disiplin, kerjaSama, komunikasi, tanggungJawab, inisiatif, catatanMentor, nilaiAkhir)
- `internship_status` - Status tracking (participantId, status, tanggalMulai, tanggalSelesai, progress)