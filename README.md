# 📄 Resume Builder

A modern, interactive **Resume Builder** application built with React, featuring live preview and professional PDF export capabilities. Create stunning resumes with an intuitive editor and see changes in real-time.

![Resume Builder](https://img.shields.io/badge/React-18.3.1-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.3-38bdf8)
![Vite](https://img.shields.io/badge/Vite-5.2.11-646cff)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎉 Recent Updates (October 2024)

### ✅ Security Enhancements
- **XSS Protection**: All user inputs sanitized with DOMPurify
- **Image Validation**: File type, size, and dimension checks (max 5MB, 100-4000px)
- **URL Validation**: Blocks dangerous protocols (javascript:, data:, etc.)

### ✅ UX Improvements (Phase 1 - In Progress)
- **✨ Undo/Redo**: Full undo/redo with Ctrl+Z, Ctrl+Y keyboard shortcuts
- **⚡ Performance**: React.memo optimization for snappier UI
- **🔔 Toast Notifications**: Beautiful feedback for all actions
- **💾 Auto-Save**: Drafts saved automatically to localStorage every 2s
- **📝 Character Counters**: Real-time limits on text fields

See [COMPLETED_IMPROVEMENTS.md](./COMPLETED_IMPROVEMENTS.md) for details and [UX_ROADMAP.md](./UX_ROADMAP.md) for the full plan.

---

## ✨ Features

### 🎨 **Comprehensive Resume Sections**
- **Identity**: Name, professional headline, and profile summary
- **Profile Photo**: Upload your photo or use a URL (optional)
- **Contact & Links**: Location, phone, email, and custom labeled links (LinkedIn, portfolio, etc.)
- **Skills**: Tag-based skills display with visual chips
- **Employment History**: Multi-level job entries with projects and bullet points
- **Certifications**: Professional certifications with issuer and dates
- **Education**: Academic qualifications and training

### 🚀 **Powerful Functionality**
- **📱 Live Preview**: Real-time A4-sized (210mm × 297mm) resume preview
- **📥 Import/Export**: Save and load resumes as JSON files
- **🖨️ PDF Export**: Multi-page PDF generation with professional formatting
- **📋 Sample Data**: Pre-loaded example resume to get started quickly
- **🎯 Responsive Design**: Works seamlessly on desktop and tablet devices
- **♻️ Auto-save Ready**: State management ready for localStorage integration

### 💎 **Professional Design**
- Clean two-column layout (30% sidebar / 70% main content)
- Elegant teal color scheme
- Professional typography with proper hierarchy
- Print-optimized styling
- Gradient sidebar background

## 🛠️ Tech Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.2.11
- **Styling**: Tailwind CSS 3.4.3
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React
- **Language**: JavaScript (ES2020+)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone or download the repository**
   ```bash
   cd ResumeBuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - The app will automatically open at `http://localhost:3000`

## 🎯 Usage

### Getting Started

1. **Load Sample Data**: Click "Load Sample" to see a pre-filled resume example
2. **Edit Sections**: Use the left sidebar editor to modify each section
3. **Live Preview**: Watch your resume update in real-time on the right
4. **Export**: Download as JSON or generate a PDF

### Editor Features

#### Adding Content
- Click **"Add [item]"** buttons to create new entries
- Fill in the form fields for each section
- Use the **trash icon** to remove unwanted items

#### Skills Section
- Enter skills separated by commas
- They'll automatically appear as styled pills/chips

#### Employment History
- Add multiple job positions
- Each job can have multiple sub-sections (projects/areas)
- Each sub-section supports multiple bullet points

#### Photo Upload
- Toggle "Show photo" checkbox
- Upload an image file OR paste an image URL
- Photo appears in the sidebar at 112px × 112px

### Import/Export

**Export JSON**
```javascript
// Click "Export JSON" to download your resume data
// File: resume.json
```

**Import JSON**
```javascript
// Click "Import JSON" and select a previously exported file
// Your resume will be instantly restored
```

**Export PDF**
```javascript
// Click "Export to PDF"
// Multi-page support automatically handles long resumes
// Filename: [YourName].pdf
```

## 📁 Project Structure

```
ResumeBuilder/
├── public/
│   └── vite.svg           # Favicon
├── src/
│   ├── ResumeBuilder.jsx  # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Tailwind CSS imports
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── .eslintrc.cjs          # ESLint rules
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🧩 Component Architecture

### Main Components

**`ResumeBuilder`** - Main application container
- State management for resume data
- Import/Export functionality
- PDF generation logic

**`Section`** - Reusable section wrapper
- Consistent styling for editor sections

**`Row`** - Repeatable item container
- Used for jobs, certifications, education, etc.
- Built-in remove functionality

**`Aside`** - Resume sidebar (preview)
- Contact details
- Links
- Skills display
- Photo rendering

**`Main`** - Resume main content (preview)
- Name and headline
- Profile summary
- Employment history
- Certifications
- Education

### Helper Functions

| Function | Purpose |
|----------|---------|
| `update()` | Update state using dot-notation paths |
| `addRow()` / `removeRow()` | Manage array-based sections |
| `printPDF()` | Generate multi-page PDF export |
| `safeHydrate()` | Validate and sanitize imported JSON |
| `formatLocation()` | Normalize location strings |
| `normalizeUrl()` | Ensure URLs have proper protocol |

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      teal: { /* your custom teal shades */ },
    },
  },
}
```

### Adjusting Resume Layout

Modify the grid columns in `ResumeBuilder.jsx`:
```jsx
{/* Current: 30% sidebar / 70% main */}
<div className="grid grid-cols-[30%_1fr]">
  
{/* Example: 40% sidebar / 60% main */}
<div className="grid grid-cols-[40%_1fr]">
```

### Custom Fonts

Add to `tailwind.config.js`:
```javascript
fontFamily: {
  sans: ['Your Font', 'system-ui', 'sans-serif'],
}
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

## 🐛 Troubleshooting

### PDF Export Issues

**Problem**: PDF generation fails or produces blank pages

**Solutions**:
- Ensure all images are loaded before exporting
- Check browser console for CORS errors
- Try disabling browser extensions
- Use Chrome/Edge for best results

### Styling Not Applied

**Problem**: Tailwind classes not working

**Solutions**:
```bash
# Restart the dev server
npm run dev

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Import JSON Fails

**Problem**: "Invalid JSON" error

**Solutions**:
- Verify the JSON file is properly formatted
- Ensure it was exported from this application
- Check for special characters or encoding issues

## 🔮 Future Enhancements

Potential features to add:

- [ ] Multiple resume templates
- [ ] Drag-and-drop section reordering
- [ ] Color theme picker
- [ ] localStorage auto-save
- [ ] Additional export formats (DOCX, HTML)
- [ ] Resume analytics (ATS optimization)
- [ ] Cloud save/sync
- [ ] Collaborative editing
- [ ] Template marketplace

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- PDF generation powered by [jsPDF](https://github.com/parallax/jsPDF) and [html2canvas](https://html2canvas.hertzen.com/)

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation above

---

**Made with ❤️ using React and Tailwind CSS**
