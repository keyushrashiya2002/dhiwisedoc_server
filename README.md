# Dhiwise Doc

## Overview

Dhiwise Doc is a document management system that enables real-time collaboration between users. The backend is built with Node.js and MongoDB, while the frontend is developed using Next.js (with TypeScript).

---

## **Backend Setup** (Node.js)

The backend repository is available at:  
[https://github.com/keyushrashiya2002/dhiwisedoc_server](https://github.com/keyushrashiya2002/dhiwisedoc_server)

### **Prerequisites**
- Node.js (v14+ recommended)
- MongoDB (local or MongoDB Atlas)

### **Backend Environment Configuration**

Create a `.env` file in the backend root directory and include the following variables:

PORT=8000 DATABASE_URL="mongodb://localhost:27017" CLIENT_URL="http://localhost:8001"

JWT_SECRET_KEY="mydhiwisedocserverjwtsecretkey" ENCRYPT_SECRET_KEY="mydhiwisedocserverjwtsecretkey" ENCRYPT_DATA=true

MAIL_HOST="smtp.gmail.com" MAIL_PORT=587 MAIL_USER="keyushrashiya2002@gmail.com" MAIL_PASS="abpxewtwtuogquss" MAIL_FROM="keyushrashiya2002@gmail.com"

PROJECT_NAME="dhiwisedoc"


### **Run Backend Application**

1. Install dependencies:
npm install

2. For **development mode**:
npm run dev

3. For **production mode**:
npm run start


The backend server will be running on `http://localhost:8000`.

---
