import { motion } from 'framer-motion';
import { Bell, MapPin, RefreshCw, User, LogOut, Settings, ChevronDown, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification } from '@/data/aquaguardData';

interface DashboardHeaderProps {
  userLocation: { town: string; county: string } | null;
  lastUpdate: Date;
  notifications: Notification[];
  unreadCount: number;
  onNotificationsClick: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const DashboardHeader = ({
  userLocation,
  lastUpdate,
  notifications,
  unreadCount,
  onNotificationsClick,
  onMenuClick,
  showMenuButton,
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
        {/* Left: Menu + Logo & Location */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showMenuButton && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="shrink-0">
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 group-hover:shadow-lg transition-shadow">
              <span className="text-primary-foreground font-bold text-sm">AG</span>
            </div>
            <span className="font-heading font-bold text-lg hidden sm:block text-foreground">AquaGuard</span>
          </Link>
          
          {userLocation && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/30"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {userLocation.town}, {userLocation.county}
              </span>
            </motion.div>
          )}
        </div>

        {/* Right: Update time, Theme, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Last Updated */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <RefreshCw className="w-3 h-3" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onNotificationsClick}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </Button>
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-1 sm:px-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <ChevronDown className="w-4 h-4 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Location Bar */}
      {userLocation && (
        <div className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2 bg-muted/30 border-t border-border/30">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm truncate text-foreground">
            {userLocation.town}, {userLocation.county}
          </span>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
