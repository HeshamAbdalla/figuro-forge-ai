
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FiguroMascot from "./FiguroMascot";
import { useOptimizedAuth } from "@/components/auth/OptimizedAuthProvider";
import { Menu, X, User, Settings, LogOut, Image } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { user, profile, signOut, isLoading } = useOptimizedAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Generate avatar fallback from user email
  const getInitials = () => {
    if (!user?.email) return "FG";
    return user.email.substring(0, 2).toUpperCase();
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`border-b border-white/10 fixed w-full z-50 transition-colors duration-300 ${
        scrolled || mobileMenuOpen ? "bg-figuro-darker/95 backdrop-blur-md" : "backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-2">
          <Link to={user ? "/studio" : "/"} className="flex items-center gap-2">
            <div className="hidden sm:block">
              <FiguroMascot size={40} />
            </div>
            <motion.div
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-figuro-accent font-bold text-2xl">Figuros</span>
              <span className="text-white font-bold text-2xl">.AI</span>
            </motion.div>
          </Link>
        </div>
        
        {/* Desktop Navigation - Always visible on desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to={user ? "/studio" : "/"} 
            className="text-sm text-white/70 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
          >
            {user ? "Studio" : "Home"}
          </Link>
          <Link 
            to="/gallery" 
            className="text-sm text-white/70 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
          >
            Gallery
          </Link>
          <Link 
            to={user ? "/profile" : "/solutions"} 
            className="text-sm text-white/70 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
          >
            {user ? "Personal Hub" : "Solutions"}
          </Link>
          {user ? (
            <Link 
              to="/docs" 
              className="text-sm text-white/70 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
            >
              Docs
            </Link>
          ) : (
            <>
              <Link 
                to="/pricing" 
                className="text-sm text-white/70 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
              >
                Pricing
              </Link>
              <Link 
                to="/docs" 
                className="text-sm text-white/70 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
              >
                Docs
              </Link>
            </>
          )}
        </nav>
        
        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-figuro-darker/50 animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-figuro-accent">
                    <AvatarImage 
                      src={profile?.avatar_url || `https://www.gravatar.com/avatar/${user.email ? user.email.trim().toLowerCase() : ''}?d=mp`} 
                      alt={profile?.full_name || user.email || "User"} 
                    />
                    <AvatarFallback className="bg-figuro-accent text-white">{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile/figurines")}>
                  <FiguroMascot size={16} className="mr-2" />
                  <span>My Figurines</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile/pictures")}>
                  <Image className="mr-2 h-4 w-4" />
                  <span>Profile Pictures</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="text-sm hidden md:inline-flex" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button 
                className="bg-figuro-accent hover:bg-figuro-accent-hover text-white"
                onClick={() => navigate("/auth")}
              >
                Sign Up
              </Button>
            </>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-figuro-darker border-t border-white/10"
          >
            <div className="container mx-auto py-4 flex flex-col space-y-4 px-4">
              <Link 
                to={user ? "/studio" : "/"} 
                className="text-white py-2 px-4 rounded-md hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {user ? "Studio" : "Home"}
              </Link>
              <Link 
                to="/gallery" 
                className="text-white py-2 px-4 rounded-md hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                to={user ? "/profile" : "/solutions"} 
                className="text-white py-2 px-4 rounded-md hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {user ? "Personal Hub" : "Solutions"}
              </Link>
              {user ? (
                <Link 
                  to="/docs" 
                  className="text-white py-2 px-4 rounded-md hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Docs
                </Link>
              ) : (
                <>
                  <Link 
                    to="/pricing" 
                    className="text-white py-2 px-4 rounded-md hover:bg-white/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link 
                    to="/docs" 
                    className="text-white py-2 px-4 rounded-md hover:bg-white/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Docs
                  </Link>
                </>
              )}
              
              {!user && (
                <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                  <Button variant="outline" onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}>
                    Sign In
                  </Button>
                  <Button 
                    className="bg-figuro-accent hover:bg-figuro-accent-hover text-white w-full"
                    onClick={() => {
                      navigate("/auth");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
