# QuantityMeasurementApp-Frontend

## 📌 Overview

**QuantityMeasurementApp-Frontend** is a React-based web application that allows users to perform and manage different quantity measurements (such as length, weight, temperature, etc.) through an interactive and user-friendly interface.

This frontend application communicates with backend services (monolithic or microservices) to perform conversions, store history, and manage user authentication.

---

## 🚀 Features

* 🔐 User Authentication (Login/Register)
* 📏 Perform Quantity Conversions (Length, Weight, etc.)
* 📊 Dashboard for managing measurements
* 🕘 View Conversion History
* 🎨 Responsive UI with modern styling
* 🔄 Integration with backend APIs

---

## 🛠️ Tech Stack

* **Frontend Framework:** React.js
* **Routing:** React Router
* **Styling:** CSS Modules
* **State Management:** React Hooks
* **API Communication:** Fetch / Axios (based on implementation)

---

## 📁 Project Structure

```
QuantityMeasurementApp-Frontend/
│── public/
│── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── HistoryModal.jsx
│   │   ├── Auth.module.css
│   │   ├── Dashboard.module.css
│   ├── App.jsx
│   ├── index.js
│   ├── index.css
│── .env
│── package.json
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd QuantityMeasurementApp-Frontend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup environment variables

Create a `.env` file in the root directory:

```
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 4️⃣ Run the application

```bash
npm start
```

The app will run at:

```
http://localhost:3000
```

---

## 🔗 Backend Integration

Make sure your backend service is running before starting the frontend.

Example:

```
http://localhost:8080/api
```

Update API URLs in your frontend code or `.env` file accordingly.

---

## 📦 Build for Production

```bash
npm run build
```

This will create an optimized production build in the `build/` folder.

---

## 🧪 Available Scripts

* `npm start` → Runs the app in development mode
* `npm build` → Builds the app for production
* `npm test` → Runs tests (if configured)

---

## ❗ Common Issues & Fixes

### 🔴 Error: Cannot find module 'react-router-dom'

```bash
npm install react-router-dom
```

### 🔴 Port already in use (3000)

```bash
npx kill-port 3000
```

---
## 🔮 Future Enhancements

* Add more measurement types
* Role-based authentication
* Better UI/UX improvements
* Microservices integration

---
