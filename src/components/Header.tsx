
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, LogOut, Settings, CreditCard, HelpCircle, FileText } from "lucide-react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
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

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Get user avatar URL from user metadata or profile
  const getUserAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  };

  // Get user display name
  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name;
    const lastName = user?.user_metadata?.last_name;
    const fullName = user?.user_metadata?.full_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (fullName) {
      return fullName;
    }
    return user?.email || "User";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-purple-600"></div>
            <span className="hidden font-bold sm:inline-block">Figuros</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex">
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Logo */}
        <div className="mr-2 flex md:hidden">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-purple-600"></div>
            <span className="font-bold">Figuros</span>
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other content can go here */}
          </div>
          
          {/* User Menu / Auth Buttons */}
          <nav className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-border">
                      <AvatarImage src={getUserAvatarUrl()} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 bg-popover border border-border shadow-lg" 
                  align="end" 
                  forceMount
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscription" className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/docs" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Documentation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/support" className="cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Support
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
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden ml-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background border-border">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="text-foreground/60 hover:text-foreground transition-colors py-2 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {user ? (
                    <>
                      <div className="border-t border-border pt-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-8 w-8 border-2 border-border">
                            <AvatarImage src={getUserAvatarUrl()} alt={getUserDisplayName()} />
                            <AvatarFallback className="bg-muted text-xs font-medium">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">{getUserDisplayName()}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors py-2 text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <Link
                            to="/subscription"
                            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors py-2 text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            <CreditCard className="h-4 w-4" />
                            Billing
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors py-2 text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors py-2 text-sm text-left w-full"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="border-t border-border pt-4 space-y-2">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start" size="sm">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full" size="sm">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
