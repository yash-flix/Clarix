<div align="center">

# 🎟️ Clarix: AI-Powered Ticket Management System  

### 🚀 An Intelligent, Scalable, AI-Driven Ticket Workflow

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Inngest](https://img.shields.io/badge/Inngest-3b82f6?style=for-the-badge)
![Google Gemini API](https://img.shields.io/badge/Google%20Gemini%20API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Mailtrap](https://img.shields.io/badge/Mailtrap-009688?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 🧠 Overview  

**Clarix** is an **AI-powered ticket management system** designed for efficient, intelligent, and automated support handling.  
Built as part of the **Chaicode YouTube learning journey**, it demonstrates how modern web apps can leverage **AI + event-driven architecture** to revolutionize user support.

---

## ✨ Features at a Glance

### 🤖 AI-Empowered Ticket Workflow
- Instantly categorizes tickets using **Google Gemini AI**
- Determines **priority** (urgent, high, normal, low)
- Generates **AI-suggested notes** for faster resolution
- Detects **ticket type** (technical, billing, etc.)

### 🧠 Adaptive Moderator Assignment
- Matches tickets to moderators via **skill-based routing**
- Automatically **escalates to admin** if no skill match found
- Supports **dynamic moderator skill management**

### 👥 Smart User Management
- **Role-based access**: User, Moderator, Admin  
- Moderators can **edit skill profiles**
- Secure **JWT authentication**

### ⚙️ Efficient Background Processing
- **Inngest-powered event engine** for async workflows
- **Email notifications** for users and moderators
- **Decoupled AI processing** for high concurrency

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend | Node.js + Express |
| Database | MongoDB |
| Authentication | JSON Web Tokens (JWT) |
| Background Jobs | Inngest |
| AI Layer | Google Gemini API |
| Emails | Nodemailer + Mailtrap |
| Development | Nodemon |

---

## 🧩 Prerequisites

Before running Clarix, make sure you have:

- Node.js **v14+**
- A **MongoDB** deployment (local or cloud)
- A **Google Gemini API Key**
- **Mailtrap** credentials for email sandbox testing

---

## ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

git clone <your-repository-url>
cd clarix-ticket-system
---

## 2️⃣ Install Dependencies
npm install
---

## 3️⃣ Configure Environment Variables

Create a .env file in the project root and include the following:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
MAILTRAP_SMTP_HOST=your_mailtrap_host
MAILTRAP_SMTP_PORT=your_mailtrap_port
MAILTRAP_SMTP_USER=your_mailtrap_user
MAILTRAP_SMTP_PASS=your_mailtrap_password
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000

🚦 Running Clarix Locally
▶️ Start the Main Server
npm run dev

⚙️ Start Background Jobs with Inngest
npm run inngest-dev

🧠 How Clarix Works
1️⃣ Ticket Submission

User submits a ticket with a title & description.

Ticket is stored in MongoDB.

2️⃣ AI Analysis (Triggered by Inngest)

Event: on-ticket-created

Gemini AI analyzes the ticket and returns:

Required skills

Priority level

Additional context

Ticket category

3️⃣ Moderator Assignment

Clarix matches required skills with moderator profiles.

Uses Regex-based matching for flexibility.

Escalates to admin if no suitable match found.

4️⃣ Notification

Moderator receives an email with:

Ticket details

AI-generated insights

Priority level

📝 REST API Overview
🔐 Authentication
Method	Endpoint	Description
POST	/api/auth/signup	Register a new user
POST	/api/auth/login	Authenticate & receive JWT
🎫 Tickets
Method	Endpoint	Description
POST	/api/tickets	Submit a new ticket
GET	/api/tickets	View all user tickets
GET	/api/tickets/:id	View a ticket by ID
🛡️ Admin Operations
Method	Endpoint	Description
GET	/api/auth/users	Fetch all users (Admin only)
POST	/api/auth/update-user	Update user roles or skills (Admin only)
🧪 Try It Yourself
🌀 Start Background Jobs
npm run inngest-dev

🧾 Create a Sample Ticket (via cURL)
curl -X POST http://localhost:3000/api/tickets \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
  "title": "Integration Failure in Staging",
  "description": "Payment gateway not responding during transaction on staging environment."
}'

🔍 Troubleshooting
🧩 Port Already in Use?
lsof -i :8288
kill -9 <PID>

🧠 AI Issues?

Verify your GEMINI_API_KEY

Check your API quota and input format

📧 Email Not Sending?

Confirm your Mailtrap credentials

Verify SMTP host, port, username, and password

📚 Dependencies Reference
Package	Version
@inngest/agent-kit	^0.7.3
bcrypt	^5.1.1
cors	^2.8.5
dotenv	^16.5.0
express	^5.1.0
inngest	^3.35.0
jsonwebtoken	^9.0.2
mongoose	^8.13.2
nodemailer	^6.10.1
💡 Scripts Reference
Command	Description
npm install	Install dependencies
npm run dev	Run the Express server in development mode
npm run inngest-dev	Start Inngest background jobs
npm start	Run Clarix in production mode
🖼️ Preview (Optional)

Add your project screenshots or GIF previews here.

Example:

/assets/clarix-demo.gif

🤝 Contributing

Clarix is developed for educational and demonstration purposes as part of the Chaicode YouTube Learning Series.
Direct pull requests are not accepted, but feel free to fork and experiment with the project.

🙏 Acknowledgments

Inngest — Robust event-driven background engine

Google Gemini API — AI-powered ticket analysis

Mailtrap — Safe email testing environment

MongoDB — Reliable NoSQL database

<div align="center">

🌟 Star this repo if you like Clarix!

Built with ❤️ by Yash Rane
— part of the Chaicode Learning Journey.

</div> ```
