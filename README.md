# 🚀 FundIt – Crowdfunding Platform

![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![JSON Server](https://img.shields.io/badge/Backend-JSON--Server-green)
![Status](https://img.shields.io/badge/status-finished-brightgreen)
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](http://3.73.158.190:16798/)

## 🌐 Live Demo

👉 http://3.73.158.190:16798/

FundIt is a full-stack crowdfunding platform simulation built using **HTML, CSS, JavaScript, and JSON Server**.  
The project demonstrates a real-world crowdfunding system with authentication, role-based access, campaign creation, and admin management using a mock REST API.

This project was developed as a final full-stack JavaScript assignment.

---

## 📌 Overview

FundIt allows users to create fundraising campaigns and support other campaigns, while administrators can manage the entire system.

The backend is powered by **JSON Server**, which simulates a REST API using a local database.

Roles supported:

- Guest → browse campaigns  
- User → create & manage campaigns  
- Admin → manage users & campaigns  

---

## ✨ Features

### 🔐 Authentication

- Signup  
- Login  
- Logout  
- Role-based access control  

### 💰 Campaign System

- Create new campaign  
- View all campaigns  
- View campaign details  
- Support campaigns  

### 👤 User System

- Profile page  
- View & edit user campaigns  
- View user pledge history  

### 🛠 Admin Panel

- Manage users (ban & unban)
- Manage campaigns (approve, delete & edit)
- View all data  

### 🎨 Frontend

- Multi-page UI  
- Modular JavaScript  
- Organized CSS architecture  
- Responsive design  

---

## 🧱 Project Architecture

Frontend:

- HTML5 pages  
- Modular JavaScript files  
- CSS split into components / layout / base / responsive  

Backend (Mock API):

- JSON Server  
- db.json as database  

Structure:

```
CrowdFunding - Final Project
│
├── db.json
├── package.json
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── profile.html
│   ├── admin.html
│   ├── new-campaign.html
│
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── user.js
│   │   ├── profile.js
│   │   ├── new_camp.js
│   │   ├── admin.js
│   │   └── utils.js
│
│   ├── css/
│   │   ├── style.css
│   │   ├── layout.css
│   │   ├── pages.css
│   │   ├── components.css
│   │   ├── responsive.css
│   │   ├── base.css
│   │   └── variables.css
```

---

## 🛠 Tech Stack

| Technology     | Usage           |
|--------------|---------------|
| HTML5        | Structure      |
| CSS3         | Styling        |
| JavaScript ES6 | Logic        |
| JSON Server  | Fake REST API  |
| Node.js      | Running server |
| npm          | Package manager|
| Git          | Version control|

---

## ▶️ How to Run

### 1️⃣ Install dependencies

```
npm install json-server
```

### 2️⃣ Increase JSON Server payload limit (required for image saving as Base64 string)

Open the following file:

```
node_modules/milliparsec/dist/index.js
```

Find this line:

```
const defaultPayloadLimit
```

Increase the value if needed (for example):

```
const defaultPayloadLimit = 10485760; // 10MB
```

This step is required to prevent errors when sending large request bodies.

### 3️⃣ Start the backend server

```
npx json-server --watch db.json --port 3000
```

### 4️⃣ Open the frontend

Open in your browser:

```
http://localhost:3000/
```
---

## 📡 API Resources

- /users  
- /campaigns  
- /pledges  

Stored in:

```
db.json
```

---

## 🎯 Learning Goals

This project demonstrates:

- REST API usage  
- CRUD operations  
- Authentication logic  
- Role-based systems  
- Modular JavaScript  
- JSON Server backend  
- Multi-page frontend apps  

---

## 🔮 Future Improvements

- Real backend (Node.js + Express)  
- Database (MongoDB / SQL)  
- Image upload  
- Payment integration  
- JWT authentication  
- Better UI / UX  

---

## 👨‍💻 Author

Mohamed Khaled Tawfeek Hasan Ibrahim  

GitHub: https://github.com/MoOps-dev

---

## ⭐ If you like this project, give it a star!