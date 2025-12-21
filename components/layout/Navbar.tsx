'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  User,
  ChefHat,
  Globe,
  Menu,
  X,
  Settings,
  Calendar,
  Star,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'yo', name: 'Yorùbá' },
  { code: 'es', name: 'Español' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ha', name: 'Hausa' },
  { code: 'ijc', name: 'Izon' },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [selectedLang, setSelectedLang] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const userEmail = session?.user?.email;
  const userName = session?.user?.name;
  const userRole = (session?.user as any)?.role || 'CUSTOMER';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsSearchOpen(false);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/', redirect: true });
  };

  const navItems = [
    { label: 'Find Chefs', href: '/chefs' },
    { label: 'Cuisines', href: '/cuisines' },
    { label: 'How It Works', href: '/how-it-works' },
  ];

  const aboutItems = [
    { label: 'About Us', href: '/about' },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Our Team', href: '/our-team' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="w-full z-50 bg-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-white" />
              <span className="hidden sm:inline-block font-bold text-xl text-white">
                CookFort
              </span>
              <span className="sm:hidden font-bold text-xl text-white">CF</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary cursor-pointer',
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-white/90 hover:text-white'
                  )}
                >
                  {item.label}
                </button>
              ))}

              {/* About Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-sm font-medium transition-colors hover:text-primary cursor-pointer text-white/90 hover:text-white flex items-center gap-1"
                  >
                    About
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {aboutItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' && (
              <div className="text-white/70 text-sm">Loading...</div>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 text-white hover:text-white hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-white hover:bg-white/10">
                  <Globe className="h-4 w-4" />
                  <span>{selectedLang.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Chef Dashboard Button - Show for chef users, Become a Chef for others */}
            {status !== 'loading' && isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link href={userRole === 'CHEF' ? '/chef' : '/auth/chef-signup'}>
                  <ChefHat className="h-4 w-4" />
                  {userRole === 'CHEF' ? 'Chef Dashboard' : 'Become a Chef'}
                </Link>
              </Button>
            )}

            {/* User Menu */}
            {status !== 'loading' && isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white hover:text-white hover:bg-white/10"
                  >
                    {userRole === 'CHEF' ? (
                      <ChefHat className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span>{userName || userEmail?.split('@')[0] || 'Account'}</span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userEmail || 'My Account'}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/user">
                      <User className="h-4 w-4 mr-2" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/user/profile">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/user/bookings">
                      <Calendar className="h-4 w-4 mr-2" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/user/favourites">
                      <Star className="h-4 w-4 mr-2" />
                      Favourites
                    </Link>
                  </DropdownMenuItem>

                  {userRole === 'CHEF' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/chef">
                          <ChefHat className="h-4 w-4 mr-2" />
                          Chef Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : status !== 'loading' ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/auth/signin">
                    <User className="h-5 w-5 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button className="bg-white text-black hover:bg-white/90" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/10"
              onClick={toggleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/10"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div
        className={cn(
          'md:hidden bg-black transition-all duration-300 overflow-hidden',
          isSearchOpen ? 'max-h-24 py-4 border-b border-white/20' : 'max-h-0'
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search chefs, cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 text-white hover:text-white hover:bg-white/10"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden bg-black transition-all duration-300 overflow-hidden',
          isMenuOpen ? 'max-h-[80vh] overflow-y-auto' : 'max-h-0'
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-4 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                'block py-2 text-base font-medium transition-colors hover:text-primary w-full text-left',
                pathname === item.href ? 'text-primary' : 'text-white/90 hover:text-white'
              )}
            >
              {item.label}
            </button>
          ))}

          {/* About section in mobile */}
          <div className="border-t border-white/20 pt-4 pb-4">
            <div className="text-sm font-medium text-white/70 mb-2">About</div>
            {aboutItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'block py-2 pl-4 text-base font-medium transition-colors hover:text-primary w-full text-left',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-white/90 hover:text-white'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            {isLoggedIn ? (
              <>
                <Button asChild>
                  <Link href="/user" className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    My Dashboard
                  </Link>
                </Button>
                {userRole === 'CHEF' ? (
                  <Button variant="outline" asChild>
                    <Link href="/chef" className="flex items-center">
                      <ChefHat className="h-5 w-5 mr-2" />
                      Chef Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href="/auth/chef-signup" className="flex items-center">
                      <ChefHat className="h-5 w-5 mr-2" />
                      Register as Chef
                    </Link>
                  </Button>
                )}
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth/signin" className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button className="bg-white text-black hover:bg-white/90" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
