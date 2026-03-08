import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Waves, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHome ? 'bg-transparent' : 'bg-card/80 backdrop-blur-xl border-b border-border/50'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Waves className={`w-7 h-7 transition-colors ${isHome ? 'text-accent' : 'text-primary'}`} />
            </div>
            <span className={`font-heading font-bold text-lg tracking-tight ${isHome ? 'text-primary-foreground' : 'text-foreground'}`}>
              AquaGuard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isHome ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors ${isHome ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Dashboard
            </Link>
            <ThemeToggle variant={isHome ? 'glass' : 'default'} />
            <Link to="/auth">
              <Button variant={isHome ? 'glass' : 'default'} size="default">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-muted/20 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className={`w-5 h-5 ${isHome ? 'text-primary-foreground' : 'text-foreground'}`} />
            ) : (
              <Menu className={`w-5 h-5 ${isHome ? 'text-primary-foreground' : 'text-foreground'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border/50"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="font-medium text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="font-medium text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                Dashboard
              </Link>
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <Link to="/auth" onClick={() => setIsOpen(false)} className="flex-1 ml-3">
                  <Button variant="default" size="lg" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
