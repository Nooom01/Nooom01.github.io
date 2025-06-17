# 🌸 Kawaii Blog - Quick Setup Guide

## 🚀 How to Start Your Blog

### Option 1: Double-click `launch.bat`
- Simply double-click the `launch.bat` file in this folder
- Follow the on-screen instructions

### Option 2: Use Command Prompt
1. Open Command Prompt in this folder
2. Run: `node node_modules/next/dist/bin/next dev`
3. Visit: http://localhost:3000

### Option 3: Fix PowerShell (Permanent Solution)
1. Right-click PowerShell and "Run as Administrator"
2. Run: `Set-ExecutionPolicy RemoteSigned`
3. Then you can use: `npm run dev`

## 🔧 If You Get Errors

### "Cannot be loaded because running scripts is disabled"
- This is a Windows security feature
- Use Option 3 above to fix permanently
- Or use Command Prompt instead of PowerShell

### "Connection Refused" in Browser
- Make sure the server is running (you should see "Local: http://localhost:3000")
- Try a different port: `node node_modules/next/dist/bin/next dev --port 3001`
- Check if another app is using port 3000

### "Module not found" errors
- Run: `npm install` to reinstall dependencies

## 🌐 Accessing Your Blog

Once the server starts, you'll see:
```
▲ Next.js 15.3.3
- Local:        http://localhost:3000
```

Open that URL in your browser to see your kawaii blog! 🎉

## 📝 Next Steps

1. **See your blog** - Visit http://localhost:3000
2. **Set up database** - Follow the main README.md for Supabase setup
3. **Customize** - Edit colors, text, and features as you like!

---

💡 **Tip**: Keep this Command Prompt window open while using your blog. Closing it will stop the server.