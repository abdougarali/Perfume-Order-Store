# Quick Start Guide - Perfume Brand MVP

## ✅ Current Status

- ✅ **Dependencies Installed** (373 packages)
- ✅ **Project Structure Complete**
- ✅ **All Files Created** (25+ files)
- ✅ **No Linting Errors**
- ✅ **.env.local File Exists**

## 🚀 To Start the Server

### Step 1: Verify Environment Variables

Make sure your `.env.local` file contains:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/perfume-db?retryWrites=true&w=majority
ADMIN_PASSWORD=your_secure_password
```

**Note**: For testing without MongoDB, you can temporarily use a dummy value, but orders won't be saved.

### Step 2: Start Development Server

```bash
cd C:\Users\ASUS\Desktop\Library_projects\Perfume-Orders-MVP
npm run dev
```

The server will start on: **http://localhost:3008**

### Step 3: Access the Application

- **Homepage**: http://localhost:3008
- **Admin Login**: http://localhost:3008/admin/login

## 🔧 If MongoDB is Not Set Up Yet

You can still test the frontend:

1. The homepage will load with all products
2. Shopping cart will work (localStorage)
3. Order submission will fail (needs MongoDB), but UI works
4. Admin dashboard won't work (needs MongoDB)

## 📝 Testing Checklist

Once server is running:

1. ✅ Visit homepage - should see luxury perfume design
2. ✅ Browse products by category
3. ✅ Search for products
4. ✅ Open product details modal
5. ✅ Add products to cart
6. ✅ Open cart drawer
7. ✅ Try to submit order (will fail without MongoDB, but form works)
8. ✅ Visit admin login page
9. ✅ Try admin login (will need MongoDB for full functionality)

## 🎨 What You'll See

### Homepage Features:
- Hero section with "Discover Luxury Fragrances"
- Bestsellers section (8 featured perfumes)
- 5 category carousels (EDP, EDT, Men's, Women's, Unisex)
- "How to Order" section (4 steps)
- "Why Choose Us" section (4 features)
- FAQ section (5 questions)
- Footer

### Product Features:
- Product cards with luxury design
- Volume selection (50ml, 100ml, 200ml)
- Fragrance notes display
- Bestseller badges
- High-quality image display

## ⚠️ Important Notes

1. **Port 3008**: The server runs on port 3008 (different from Fashion MVP on 3007)
2. **MongoDB Required**: For full functionality, MongoDB Atlas connection is needed
3. **Images**: Product images will use Unsplash fallback if local images aren't added yet
4. **Admin Password**: Set in `.env.local` as `ADMIN_PASSWORD`

## 🐛 Troubleshooting

### Port Already in Use
If port 3008 is busy, change it in `package.json`:
```json
"dev": "next dev -p 3009"
```

### MongoDB Connection Error
- Check `MONGODB_URI` in `.env.local`
- Ensure MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas

### Images Not Loading
- Images will use Unsplash fallback automatically
- To add real images, place them in `public/images/perfumes/` folders

## ✨ Ready to Test!

The project is **fully functional** and ready for testing. Just run:

```bash
npm run dev
```

And visit: **http://localhost:3008**

Happy testing! 🎉
