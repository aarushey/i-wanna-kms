# UniBook: Campus Event & Venue Booking Dashboard

A modern, production-grade 3-tier enterprise academic system combining **MySQL 8.0 (RDBMS)**, a **Java 17 OOP & Concurrency Backend REST Server**, and a **Next.js 16 + Tailwind CSS Frontend**.

---

## Architecture Overview

```
                      ┌────────────────────────────┐
                      │    Next.js 16 Frontend     │
                      │  (Port 3000 / Vercel / UI) │
                      └─────────────┬──────────────┘
                                    │ HTTP / REST JSON
                                    ▼
                      ┌────────────────────────────┐
                      │    Java 17 REST Backend    │
                      │   (Port 8080 / Embedded)   │
                      └───────┬─────────────┬──────┘
             Primary JDBC     │             │ Fallback
                              ▼             ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │     MySQL 8.0 Live     │      │   H2 In-Memory Engine  │
       │  (Triggers, SP, Views) │      │  (Zero-Config Offline) │
       └────────────────────────┘      └────────────────────────┘
```

---

## Deployment Strategies

### Strategy 1: One-Command Docker Deployment (Recommended for Local / VPS)

Run the entire stack (MySQL 8.0, Java Backend, Next.js Frontend) with a single command:

```bash
docker compose up --build -d
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **MySQL Database**: `localhost:3306` (pre-seeded with `database/init.sql`)

To view live logs or stop:
```bash
docker compose logs -f
docker compose down
```

---

### Strategy 2: Free Cloud PaaS Deployment (Vercel + Render / Railway)

This setup provides high availability with free tiers:

#### 1. Database (Railway or Aiven MySQL)
1. Create a MySQL database on [Railway](https://railway.app) or [Aiven](https://aiven.io).
2. Connect using any MySQL client and execute the contents of [database/init.sql](database/init.sql).
3. Copy your JDBC connection URL, username, and password.
   *(Note: If you skip external MySQL, the Java backend automatically boots in zero-config H2 in-memory mode!)*

#### 2. Backend (Render / Railway / Fly.io)
1. Create a **Web Service** pointing to your Git repository.
2. Set Root Directory to `backend`.
3. Set Build Command: `mvn clean package -DskipTests`
4. Set Start Command: `java -jar target/unibook-backend-1.0.0.jar`
5. Configure Environment Variables:
   - `PORT`: `8080` (or leave default for Render)
   - `DB_URL`: `jdbc:mysql://<host>:<port>/unibook_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
   - `DB_USER`: `<your-db-user>`
   - `DB_PASSWORD`: `<your-db-password>`
6. Copy the deployed backend URL (e.g. `https://unibook-api.onrender.com`).

#### 3. Frontend (Vercel)
1. Import your Git repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://unibook-api.onrender.com/api`
4. Click **Deploy**.

---

### Strategy 3: Manual / Bare-Metal Linux VPS (Ubuntu / Debian)

#### 1. Setup MySQL:
```bash
sudo apt update && sudo apt install -y mysql-server
sudo mysql -u root -p < database/init.sql
```

#### 2. Run Backend with Systemd:
Build the executable fat jar:
```bash
cd backend
mvn clean package -DskipTests
```
Create `/etc/systemd/system/unibook-backend.service`:
```ini
[Unit]
Description=UniBook Java Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/unibook/backend
ExecStart=/usr/bin/java -jar /opt/unibook/backend/target/unibook-backend-1.0.0.jar
Restart=always
Environment="PORT=8080"
Environment="DB_URL=jdbc:mysql://localhost:3306/unibook_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
Environment="DB_USER=root"
Environment="DB_PASSWORD=your_password"

[Install]
WantedBy=multi-user.target
```
Start and enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now unibook-backend
```

#### 3. Run Frontend with PM2:
```bash
cd frontend
export NEXT_PUBLIC_API_URL="http://localhost:8080/api"
npm install
npm run build
npm install -g pm2
pm2 start npm --name "unibook-frontend" -- start -- -p 3000
pm2 save
pm2 startup
```

---

## Local Development (Quickstart)

### Terminal 1: Backend
```bash
cd backend
mvn exec:java
```
*Listens on [http://localhost:8080](http://localhost:8080).*

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000).*