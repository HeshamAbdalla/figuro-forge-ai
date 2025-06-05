
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-figuro-dark border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-figuro-accent">Figuro</h3>
            <p className="text-white/70 text-sm">
              Transform your imagination into stunning 3D figurines with our AI-powered platform.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Product</h4>
            <div className="space-y-2">
              <Link to="/features" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Pricing
              </Link>
              <Link to="/gallery" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Gallery
              </Link>
              <Link to="/docs" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Documentation
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Company</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                About
              </Link>
              <Link to="/careers" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Careers
              </Link>
              <Link to="/contact" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Contact
              </Link>
              <Link to="/community" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Community
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Legal</h4>
            <div className="space-y-2">
              <Link to="/terms" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="block text-white/70 hover:text-figuro-accent text-sm transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-white/70 text-sm">
            © 2024 Figuro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
