# Nagpur Real Estate Platform — Deployment Guide

## Production Architecture
- **Backend:** Node.js / Express hosted on AWS Elastic Beanstalk, Render, DigitalOcean App Platform, or Railway.
- **Frontend:** Static SPA build generated via Vite, deployed on Vercel, Netlify, or AWS CloudFront/S3.
- **Database:** MongoDB Atlas M10+ replica set in AWS `ap-south-1` (Mumbai) region for minimal latency to Nagpur users.
- **Image Storage:** Cloudinary or AWS S3 bucket.

---

## 1. MongoDB Atlas Network Access
1. In MongoDB Atlas Dashboard, navigate to **Network Access**.
2. Add your production server's static IP address (or `0.0.0.0/0` with restricted database user authentication).
3. Ensure the database user has `readWrite` access to the `nagpur_real_estate` database.

---

## 2. Production Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<prod_user>:<prod_pass>@cluster0.n3m8vyc.mongodb.net/nagpur_real_estate?retryWrites=true&w=majority&appName=Cluster0
JWT_ACCESS_SECRET=min_64_random_hex_characters
JWT_REFRESH_SECRET=min_64_random_hex_characters
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=https://nagpurestate.com
ADMIN_URL=https://admin.nagpurestate.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OTP_MODE=production
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_msg91_dlt_approved_template_id
```

### Frontend (`frontend/.env.production`)
```env
VITE_API_BASE_URL=https://api.nagpurestate.com/api/v1
VITE_APP_NAME="Nagpur Real Estate"
```

---

## 3. Production Build & Start

### Frontend Build
```bash
cd frontend
npm run build
# Outputs optimized production assets to frontend/dist/
```

### Backend Process Manager (PM2)
```bash
cd backend
npm install -g pm2
pm2 start src/server.js --name "nagpur-real-estate-api" -i max
pm2 save
pm2 startup
```

---

## 4. Reverse Proxy (Nginx) Example
```nginx
server {
    listen 80;
    server_name api.nagpurestate.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

