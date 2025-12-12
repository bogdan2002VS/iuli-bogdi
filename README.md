# 💕 Iuli & Bobo - Love Letter Desktop

A beautiful, interactive desktop experience built with React, TypeScript, and Tailwind CSS. Features a soft violet aesthetic with love letters, photo backgrounds, and customizable messages.

## ✨ Features

- 🎨 **Soft Violet Aesthetic**: Beautiful gradient backgrounds and UI elements
- 💌 **Love Letters**: Read and create personalized love letters
- 📸 **Google Photos Integration**: Use your own photos as dynamic backgrounds
- ✍️ **Letter Generator**: Create new love letters with a beautiful UI
- 🪟 **Window Manager**: Drag, resize, and manage multiple windows
- 🎵 **Music Integration**: Play your favorite songs
- 🌸 **Kawaii Effects**: Optional cute animations and effects
- 📱 **Social Links**: Quick access to Discord, Telegram, Spotify, and more
- 🇷🇴 **Romanian Language**: All content in Romanian for a personal touch

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository** (or download the ZIP)
   ```bash
   git clone https://github.com/yourusername/iuli-bogdi.git
   cd iuli-bogdi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in your browser**
   - The app will automatically open at `http://localhost:5173`
   - If not, manually navigate to that URL

## 🎮 How to Use

### Desktop Navigation

- **Double-click icons** to open files, folders, or show messages
- **Click the Start button** (bottom-left) to access the menu
- **Drag windows** by their title bar to move them
- **Click emojis in window corners** to minimize, maximize, or close

### Creating Love Letters

1. Click the **Start button** (bottom-left corner)
2. Select **"✍️ Creează Scrisoare Nouă"**
3. Fill in the form:
   - **Titlul Scrisorii**: The title of your letter
   - **Către**: Recipient name (optional)
   - **Conținutul**: Your love message
   - **De la**: Your name (optional)
4. Click **"Creează Scrisoarea"** to save
5. The letter will appear in a new window automatically

### Viewing Existing Letters

- Double-click the **"Iuli" or "Bobo" profile icons** for special messages
- Open **"Secretele lui Iuli"** or **"Secretele lui Bobo"** folders
- Browse through the **File Manager** to see all letters

### Customizing

- **Add your photos**: See `GOOGLE_PHOTOS_SETUP.md` for Google Photos integration
- **Change names**: Edit `src/data/filesystem.ts` to update names and messages
- **Update social links**: Modify the social media URLs in `src/data/filesystem.ts`
- **Replace profile pictures**: Add new images to `public/media/` and update references

## 📁 Project Structure

```
iuli-bogdi/
├── public/
│   └── media/           # Images, music, and media files
├── src/
│   ├── components/      # React components
│   │   ├── Desktop.tsx       # Main desktop interface
│   │   ├── LetterGenerator.tsx  # Letter creation form
│   │   ├── StartMenu.tsx     # Start menu
│   │   └── ...
│   ├── data/
│   │   └── filesystem.ts     # File system data and messages
│   ├── services/
│   │   └── googlePhotos.ts   # Google Photos API integration
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── main.tsx         # App entry point
├── GOOGLE_PHOTOS_SETUP.md  # Google Photos setup guide
└── README.md            # This file
```

## 🎨 Customization Guide

### Changing Colors

The app uses a soft violet color scheme. To change colors:

1. Edit `tailwind.config.js` to modify color palettes
2. Update `src/index.css` for global styles
3. Main colors used:
   - `violet-50` to `violet-900`: Primary UI colors
   - `purple-50` to `purple-300`: Secondary accent colors
   - `lavender-50` to `lavender-300`: Tertiary colors

### Adding New Letters

Edit `src/data/filesystem.ts`:

```typescript
{
  id: 'my-new-letter',
  name: 'Scrisoare Nouă.txt',
  type: 'file',
  icon: '💌',
  path: '/desktop/my-letter.txt',
  content: 'Conținutul scrisorii tale aici...'
}
```

### Changing Profile Pictures

1. Add your image to `public/media/`
2. Update the icon path in `src/data/filesystem.ts`:

```typescript
{
  id: 'iuliana-profile',
  icon: '/media/your-image.jpg',  // Change this
  // ... rest of the config
}
```

## 🔧 Building for Production

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

3. **Deploy**
   - Upload the `dist/` folder to your hosting service
   - Compatible with: Vercel, Netlify, GitHub Pages, etc.

### Deployment Tips

- **Vercel/Netlify**: Connect your Git repository for automatic deployments
- **GitHub Pages**: Use `gh-pages` package to deploy
- **Custom domain**: Configure DNS settings in your hosting dashboard

## 🐛 Troubleshooting

### App not loading?

- Clear browser cache
- Check browser console (F12) for errors
- Ensure you're using a modern browser
- Try running `npm install` again

### Windows not draggable?

- Make sure you're clicking on the title bar (colored header)
- Check that JavaScript is enabled in your browser

### Images not showing?

- Verify images exist in `public/media/`
- Check file paths are correct in `filesystem.ts`
- Ensure image filenames match (case-sensitive)

### Letters not saving?

- Check localStorage is enabled in your browser
- Clear localStorage and try again: `localStorage.clear()` in console
- Check browser console for error messages

## 📦 Dependencies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🎵 Adding Music

1. Place MP3 files in `public/media/`
2. The music player will automatically detect them
3. Update the Spotify links in social folders if needed

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 License

This is a personal project. Feel free to use it as inspiration for your own projects! 💕

## 🤝 Contributing

This is a personal project, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💝 Credits

Made with love by **Bogdan** for **Iuliana**

Special thanks to:
- The React team for an amazing framework
- Tailwind CSS for beautiful styling utilities
- The open-source community

## 📞 Support

Need help? Found a bug?
- Open an issue on GitHub
- Check `GOOGLE_PHOTOS_SETUP.md` for Google Photos help

---

**Enjoy your personalized love letter desktop! 💕**

*Bogdan și Iuliana forever! 💖*
