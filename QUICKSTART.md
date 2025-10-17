# 🚀 Quick Start Guide - Resume Builder

## Get Started in 30 Seconds

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser (auto-opens to http://localhost:3000)
```

## 🎯 Try These Features

### Just Implemented ✅

1. **Load Sample Resume**
   - Click "Load Sample" button
   - See beautiful toast notification: "Sample resume loaded!"

2. **Auto-Save**
   - Start editing any field
   - Wait 2 seconds
   - See "Saved [time]" indicator appear

3. **Character Counters**
   - Type in Name field
   - Watch the "X/100 characters" counter update in real-time
   - Try to exceed the limit (it won't let you!)

4. **Image Upload Validation**
   - Click "Show photo" checkbox
   - Try uploading a non-image file → Toast error
   - Try uploading a huge image (>5MB) → Toast error
   - Upload a valid image → Toast success!

5. **Security Protection**
   - Try entering `<script>alert("XSS")</script>` in your name
   - Notice it's automatically sanitized when displayed

6. **Export Resume**
   - Click "Export to PDF" → Toast success
   - Click "Export JSON" → Toast success
   - Check your downloads folder

## 🔨 Available Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
npm run lint     # Check code quality
```

## 📁 Project Structure

```
ResumeBuilder/
├── src/
│   ├── ResumeBuilder.jsx  # Main app component (726 lines)
│   ├── main.jsx           # Entry point with Toaster
│   └── index.css          # Tailwind CSS imports
├── public/
│   └── vite.svg          # Favicon
├── index.html            # HTML template
├── package.json          # Dependencies
└── Documentation/
    ├── README.md              # Main docs
    ├── IMPROVEMENTS.md        # Detailed suggestions (10k+ words)
    ├── TASKS.md              # Task breakdown (47 tasks)
    ├── PROGRESS.md           # Progress tracking
    ├── SESSION_SUMMARY.md    # What we accomplished
    └── QUICKSTART.md         # This file
```

## 🎨 How to Use

### Creating a Resume

1. **Start Fresh**
   - App loads with blank resume
   - Or loads auto-saved draft if you were working on one

2. **Fill in Details**
   - Name (required, 100 char limit)
   - Headline (100 char limit)
   - Summary (500 char limit)
   - Contact info
   - Links (label + URL)
   - Skills (comma-separated)

3. **Add Jobs**
   - Click "Add role"
   - Fill in company, dates, location
   - Add sub-sections for projects
   - Add bullet points for achievements

4. **Add Certifications**
   - Click "Add certification"
   - Fill in title, issuer, date

5. **Add Education**
   - Click "Add education"
   - Fill in degree, school, dates

6. **Export**
   - PDF: Click "Export to PDF" (auto-named from your name)
   - JSON: Click "Export JSON" to save your data

### Importing a Resume

1. Click "Import JSON"
2. Select a previously exported `.json` file
3. Resume loads instantly with toast confirmation

## 🔐 Security Features

### XSS Protection
All user inputs are sanitized using DOMPurify:
- HTML tags are stripped
- Scripts are removed
- Safe to display any user input

### Image Upload Protection
- Only image files allowed
- Max size: 5MB
- Dimensions: 100x100 to 4000x4000 pixels
- Validates before loading

### URL Protection
- Only http:// and https:// allowed
- Dangerous protocols blocked (javascript:, data:, etc.)
- External links open in new tab with security headers

## 💾 Auto-Save

- Saves automatically every 2 seconds
- Stored in browser localStorage
- Persists between sessions
- Expires after 7 days
- Shows "Saved [time]" indicator

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  teal: {
    500: '#your-color',  // Accent color
    900: '#your-color',  // Dark accent
  }
}
```

### Adjust Layout
Edit resume preview in `ResumeBuilder.jsx`:
```jsx
// Change sidebar width (currently 30%)
<div className="grid grid-cols-[30%_1fr]">
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 3001  // Use different port
}
```

### Auto-Save Not Working
- Check browser console for errors
- Verify localStorage is enabled
- Try private/incognito mode

### PDF Export Fails
- Wait for page to fully load
- Check browser console
- Try Chrome/Edge (best support)
- Disable browser extensions

## 📚 Learn More

- **Full Features**: See [README.md](./README.md)
- **Improvements**: See [IMPROVEMENTS.md](./IMPROVEMENTS.md)  
- **Tasks**: See [TASKS.md](./TASKS.md)
- **Progress**: See [PROGRESS.md](./PROGRESS.md)

## 🎯 What's Next?

See [PROGRESS.md](./PROGRESS.md) for upcoming features:

**Priority 1**: Accessibility improvements
**Priority 2**: Performance optimization (Immer)
**Priority 3**: Form validation (Zod)
**Priority 4**: Mobile responsive design

## 💡 Tips

1. **Use Sample Data**: Click "Load Sample" to see a complete resume
2. **Save Often**: Auto-save has you covered, but you can also Export JSON
3. **Test Security**: Try entering HTML/scripts to see protection in action
4. **Character Limits**: Stay within limits for ATS-friendly resumes
5. **PDF Quality**: Use Chrome/Edge for best PDF export quality

---

**Questions?** Check the documentation files or open an issue on GitHub.

**Ready to build?** Run `npm run dev` and start creating! 🚀
