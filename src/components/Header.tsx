
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Shield } from "lucide-react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useEnhancedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/studio", label: "Studio" },
    { href: "/gallery", label: "Gallery" },
    { href: "/pricing", label: "Pricing" },
    { href: "/solutions", label: "Solutions" },
    { href: "/docs", label: "Docs" }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-figuro-dark/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-figuro-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-white font-semibold text-lg">Figuros</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-white/80 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Menu / Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/security" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-white hover:text-figuro-accent">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-figuro-accent hover:bg-figuro-accent-hover">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-figuro-dark border-white/10">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-white/60 text-sm mb-4">{user.email}</p>
                      <Link
                        to="/profile"
                        className="text-white/80 hover:text-white transition-colors py-2 block"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/security"
                        className="text-white/80 hover:text-white transition-colors py-2 block"
                        onClick={() => setIsOpen(false)}
                      >
                        Security
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="text-white/80 hover:text-white transition-colors py-2 text-left w-full"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full text-white hover:text-figuro-accent">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-figuro-accent hover:bg-figuro-accent-hover">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
