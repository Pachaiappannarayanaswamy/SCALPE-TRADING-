# Deployment Guide

This guide will help you deploy SCALPE Trading Platform to various hosting services.

## 🚀 Quick Deploy Options

### 1. Vercel (Easiest - Recommended)

**Option A: Via GitHub (Recommended)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect settings
6. Click "Deploy"
7. Your site will be live in seconds!

**Option B: Via CLI**
```bash
npm i -g vercel
vercel
```

### 2. Netlify

**Option A: Drag & Drop**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your project folder
3. Done! Your site is live

**Option B: Via GitHub**
1. Push code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select repository
5. Deploy settings are auto-configured
6. Click "Deploy site"

**Option C: Via CLI**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### 3. GitHub Pages

1. Push code to GitHub repository
2. Go to repository Settings
3. Scroll to "Pages" section
4. Under "Source", select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
5. Click "Save"
6. Your site will be at: `https://yourusername.github.io/SCALPE-TRADING-WEB/`

**Note**: Make sure `index.html` is in the root directory.

### 4. Cloudflare Pages

1. Push code to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
3. Click "Create a project"
4. Connect GitHub repository
5. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `/`
6. Click "Save and Deploy"

### 5. Surge.sh

```bash
npm install -g surge
cd SCALPE
surge
# Follow prompts to create account and deploy
```

### 6. AWS S3 + CloudFront

1. Create S3 bucket
2. Enable static website hosting
3. Upload all files to bucket
4. Set bucket policy for public read access
5. (Optional) Create CloudFront distribution for CDN

### 7. Google Cloud Storage

1. Create storage bucket
2. Enable static website hosting
3. Upload files using gsutil or console
4. Make bucket publicly readable

## 📋 Pre-Deployment Checklist

- [ ] All files are committed to Git
- [ ] Test locally to ensure everything works
- [ ] Verify all links and navigation work
- [ ] Check responsive design on mobile
- [ ] Test AI Analysis feature (if using)
- [ ] Review browser console for errors

## 🔧 Post-Deployment

1. **Test your live site**
   - Check all pages load correctly
   - Test navigation
   - Verify CRUD operations work
   - Test AI Analysis (if configured)

2. **Set up custom domain** (optional)
   - Most platforms support custom domains
   - Update DNS records as instructed
   - SSL certificates are usually auto-provisioned

3. **Monitor performance**
   - Check page load times
   - Monitor API usage (Gemini API)
   - Review analytics if enabled

## 🐛 Troubleshooting

### Issue: 404 errors on page navigation
**Solution**: Ensure your hosting service is configured for SPA routing. The `netlify.toml` and `vercel.json` files handle this automatically.

### Issue: Assets not loading
**Solution**: Check that file paths are relative (not absolute). All our paths are already relative.

### Issue: CORS errors with Gemini API
**Solution**: This is normal - the API key is stored client-side. Users must provide their own API key.

### Issue: LocalStorage not persisting
**Solution**: This is browser-specific. Ensure cookies/localStorage are enabled.

## 📊 Performance Tips

1. **Enable compression** (usually automatic on modern platforms)
2. **Use CDN** (Vercel/Netlify provide this automatically)
3. **Optimize images** before uploading for AI analysis
4. **Minify CSS/JS** (optional, for production)

## 🔒 Security Notes

- API keys are stored in browser localStorage (client-side)
- No server-side authentication (demo purposes)
- For production, consider adding:
  - Backend API for authentication
  - Server-side API key management
  - Rate limiting
  - Input validation

## 📞 Need Help?

- Check platform-specific documentation
- Open an issue on GitHub
- Review browser console for errors

---

**Happy Trading! 📈**

