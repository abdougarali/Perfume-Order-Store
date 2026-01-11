# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy** (from project root):
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project settings
   - Vercel will automatically detect Next.js

4. **Set Environment Variables**:
   After deployment, go to your Vercel project dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     ADMIN_PASSWORD=your_secure_password
     ```
   - Select all environments (Production, Preview, Development)
   - Click **Save**

5. **Redeploy** (to apply environment variables):
   ```bash
   vercel --prod
   ```
   Or trigger a redeploy from the Vercel dashboard.

### Option 2: Deploy via Vercel Dashboard (Web UI)

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**:
   - In project settings → **Environment Variables**
   - Add:
     ```
     MONGODB_URI=your_mongodb_connection_string
     ADMIN_PASSWORD=your_secure_password
     ```
   - Select all environments
   - Save

4. **Deploy**:
   - Click **Deploy**
   - Wait for build to complete
   - Your site will be live!

## 📋 Pre-Deployment Checklist

- [x] ✅ Project builds successfully (`npm run build`)
- [x] ✅ All dependencies installed
- [x] ✅ `.env.local` is in `.gitignore` (sensitive data protected)
- [ ] ⚠️ MongoDB Atlas cluster is set up
- [ ] ⚠️ MongoDB connection string is ready
- [ ] ⚠️ Admin password is set

## 🔐 Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/perfume-db?retryWrites=true&w=majority` |
| `ADMIN_PASSWORD` | Password for admin login | `your_secure_password_123` |

**Important**: 
- Never commit `.env.local` to Git
- Always set environment variables in Vercel dashboard
- Use strong passwords for production

## 🌐 MongoDB Atlas Setup (If Not Done)

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create a Cluster**:
   - Choose free tier (M0)
   - Select region closest to your users
   - Create cluster

3. **Get Connection String**:
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `perfume-db` (or your preferred name)

4. **Configure Network Access**:
   - Go to **Network Access**
   - Add IP Address: `0.0.0.0/0` (allow all - for Vercel servers)
   - Or add Vercel's IP ranges (more secure)

5. **Create Database User**:
   - Go to **Database Access**
   - Create new database user
   - Remember the password (you'll need it for connection string)

## ✅ Post-Deployment

After deployment, verify:

1. **Homepage loads**: `https://your-project.vercel.app`
2. **Products display correctly**
3. **Cart works**: Add items to cart
4. **Order submission works**: Submit a test order
5. **Admin login works**: `https://your-project.vercel.app/admin/login`
6. **Admin dashboard works**: View and manage orders

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are fixed

### Environment Variables Not Working
- Make sure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### MongoDB Connection Fails
- Verify `MONGODB_URI` is correct in Vercel
- Check MongoDB Atlas network access (allow `0.0.0.0/0` for Vercel)
- Verify database user credentials

### Images Not Loading
- Images in `public/` folder are automatically served
- Check image paths are correct
- Verify images are committed to Git

## 📝 Notes

- **Free Tier**: Vercel free tier includes:
  - Unlimited deployments
  - Custom domains
  - HTTPS/SSL certificates
  - Global CDN
  
- **MongoDB Free Tier**: 
  - 512MB storage
  - Shared RAM
  - Sufficient for MVP/testing

- **Custom Domain** (Optional):
  - Go to Vercel project → Settings → Domains
  - Add your domain
  - Follow DNS configuration instructions

## 🎉 Success!

Once deployed, your perfume store will be live at:
- **Production URL**: `https://your-project.vercel.app`
- **Admin Panel**: `https://your-project.vercel.app/admin/login`

Happy deploying! 🚀
