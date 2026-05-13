# Barbarenas Marketing Dashboard

## Refactored & Modularized

A beautiful, accessible, and modular marketing analytics dashboard for Barbarenas Eco Retreat.

### 📁 File Structure

```
├── barbarenas-dashboard_2.html    # Main HTML (semantic, refactored)
├── styles.css                     # Stylesheet (separated from HTML)
├── charts.js                      # Chart.js integration & visualization
├── csv-parser.js                  # CSV upload & parsing logic
├── ui.js                          # Theme, tabs, menus, interactions
└── README.md                      # This file
```

### ✨ Features

✅ **Semantic HTML** - WCAG accessibility compliant  
✅ **Modular JavaScript** - Easy to maintain and extend  
✅ **Dark/Light Theme** - User preference persisted in localStorage  
✅ **CSV Upload** - Replace dashboard data with your own  
✅ **Responsive Design** - Mobile-friendly layouts  
✅ **Interactive Charts** - Chart.js powered visualizations  
✅ **Print/PDF Export** - Native browser print functionality  
✅ **PNG Export** - Download dashboard as image  

### 🚀 How to Use

1. Open `barbarenas-dashboard_2.html` in your browser
2. All files (CSS, JS) are automatically loaded
3. Upload a CSV to update the data

### 📊 CSV Format

Your CSV should include these columns:

```
Date | Month | Type | Detail/Theme | Stories | Followers | ViewsD1 | LikesD1 | CommentsD1 | SharedD1 | SavesD1 | ...
20   | Marzo | Reel | Culinary     | —       | 1         | 1780    | 21      | 6          | 0        | 0       | ...
```

**Supported column names (case-insensitive):**
- Date: `date`, `fecha`
- Month: `month`, `mes`
- Type: `tipo`, `type`
- Theme: `tema`, `detail`, `description`
- Stories: `stories`, `historias`
- Followers: `followers`, `seguidores`
- Views: `viewsd1`, `visualizaciones`
- And more... (see csv-parser.js for full list)

### 🎨 Customization

#### Change Colors
Edit `styles.css` and modify the theme variables:

```css
html.theme-dark{
  --accent: #7d9c6e;      /* Your color here */
  --gold: #c4a96b;
  /* ... more colors */
}
```

#### Modify Default Data
Edit the `BASE_POSTS`, `BASE_DAILY`, and `BASE_SUMMARY` objects in `barbarenas-dashboard_2.html`.

### ♿ Accessibility

- ✅ ARIA labels on all interactive elements
- ✅ Focus management for keyboard navigation
- ✅ Semantic HTML (roles, landmarks)
- ✅ Respects `prefers-reduced-motion` preference
- ✅ Color contrast WCAG AA compliant

### 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### 📝 License

Built with ❤️ for Barbarenas Eco Retreat

### 🔗 Links

- **Repository:** https://github.com/juancapajaro/MKT-Dashboard
- **Author:** @juancapajaro
