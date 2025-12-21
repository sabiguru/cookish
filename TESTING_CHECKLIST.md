# Testing Checklist - Phase 1

## ✅ Visual Testing

### Home Page
- [ ] Hero section displays with gradient background
- [ ] "CookFort" branding visible
- [ ] Two CTA buttons present
- [ ] "How It Works" section with 3 icons
- [ ] Footer displays properly

### Navbar
- [ ] Logo and brand name visible
- [ ] Search bar present (desktop)
- [ ] Navigation links work
- [ ] Language selector dropdown functions
- [ ] Sign In/Sign Up buttons visible
- [ ] Mobile menu icon appears on small screens

### Footer
- [ ] Company info section
- [ ] All footer links present
- [ ] Social media icons visible
- [ ] Copyright notice displays current year
- [ ] Responsive on mobile

## ✅ Navigation Testing

### Public Pages
- [ ] `/` - Home page loads
- [ ] `/chefs` - Find a Chef page
- [ ] `/cuisines` - Cuisines directory
- [ ] `/occasions` - Occasions page
- [ ] `/search` - Search page
- [ ] `/offers` - Offers page
- [ ] `/reviews` - Reviews page

### Protected Pages (should show message)
- [ ] `/user` - User dashboard
- [ ] `/chef` - Chef dashboard
- [ ] `/admin` - Admin panel
- [ ] `/user/bookings` - User bookings
- [ ] `/user/favourites` - Favourites

## ✅ Responsive Design

### Desktop (> 1024px)
- [ ] Full navbar with all links visible
- [ ] Search bar in navbar
- [ ] Footer in 4-column layout

### Tablet (768px - 1024px)
- [ ] Navbar collapses some items
- [ ] Footer in 2-column layout
- [ ] Search bar still visible

### Mobile (< 768px)
- [ ] Hamburger menu appears
- [ ] Search bar moves below navbar
- [ ] Footer in single column
- [ ] Touch-friendly buttons

## ✅ Interactive Elements

### Language Selector
- [ ] Globe icon clickable
- [ ] Dropdown shows 3 languages
- [ ] Selecting language updates display

### Buttons & Links
- [ ] Hover effects work
- [ ] Click navigation works
- [ ] Transitions smooth

## ✅ Console Checks

### Browser Console
- [ ] No JavaScript errors
- [ ] No 404 errors for assets
- [ ] No console warnings (or acceptable warnings only)

### Network Tab
- [ ] All CSS files load
- [ ] All JS files load
- [ ] Fonts load properly
- [ ] No failed requests

## ✅ Performance

### Initial Load
- [ ] Page loads in < 3 seconds
- [ ] No layout shift
- [ ] Fonts load smoothly

### Navigation
- [ ] Client-side navigation is instant
- [ ] No page flickers

## 🔧 Known Limitations (Phase 1)

- [ ] Authentication not fully functional (OAuth not configured)
- [ ] Database not connected (migrations not run)
- [ ] Search functionality not implemented
- [ ] Forms don't submit yet
- [ ] Protected routes don't redirect (middleware not added)

## 📝 Next Steps After Testing

If everything looks good:
1. Set up database: `docker-compose up -d postgres`
2. Run migrations: `npx prisma migrate dev --name init`
3. Seed database: `npm run prisma:seed`
4. Configure OAuth providers in `.env`
5. Test authentication flow

---

**Test Date**: ____________
**Tester**: ____________
**Status**: ⬜ Pass  ⬜ Fail  ⬜ Partial

**Notes**:
