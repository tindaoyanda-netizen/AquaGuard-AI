import { useState, useEffect, useCallback } from 'react';
import RainEffect from '@/components/RainEffect';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import LeftSidebar from '@/components/dashboard/LeftSidebar';
import EnhancedKenyaMap from '@/components/dashboard/EnhancedKenyaMap';
import RightDetailsPanel from '@/components/dashboard/RightDetailsPanel';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import ReportForm from '@/components/reporting/ReportForm';
import DemoReportForm from '@/components/reporting/DemoReportForm';
import ReportMarkers from '@/components/reporting/ReportMarkers';
import AdminDashboard from '@/components/admin/AdminDashboard';
import TeamManagement from '@/components/admin/TeamManagement';
import MyReports from '@/components/reporting/MyReports';
import AlertThresholds from '@/components/dashboard/AlertThresholds';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Plus, FileText, Menu, Beaker, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeReports } from '@/hooks/useRealtimeReports';
import { useResidentNotifications } from '@/hooks/useResidentNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  CountyData, 
  kenyaCounties, 
  getNationalStats, 
  getCountyByCoordinates,
  getTownByCoordinates,
  generateNotifications,
  Notification 
} from '@/data/aquaguardData';

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, profile, role, isLoading: authLoading, isCountyAdmin, isSubAdmin, isAdmin } = useAuth();
  
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationDisplay, setUserLocationDisplay] = useState<{ town: string; county: string } | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Sidebar state - collapsed by default on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Simulation state
  const [rainfall, setRainfall] = useState(50);
  const [consumption, setConsumption] = useState(50);
  
  // Overlay toggles
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);
  const [showFloodOverlay, setShowFloodOverlay] = useState(true);
  
  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Reporting & Admin
  const [showReportForm, setShowReportForm] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showMyReports, setShowMyReports] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showAlertThresholds, setShowAlertThresholds] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);
  const nationalStats = getNationalStats();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      setMobileSidebarOpen(false);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isMobile]);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setDashboardReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (profile?.county_id) {
      const county = kenyaCounties.find(c => c.id === profile.county_id);
      if (county) {
        setSelectedCounty(county);
        setUserLocation(county.coordinates);
        setUserLocationDisplay({
          town: county.towns[0]?.name || 'Unknown',
          county: county.name
        });
        setNotifications(generateNotifications(county.id));
      }
    } else {
      const storedLocation = localStorage.getItem('ag_location');
      if (storedLocation) {
        const loc = JSON.parse(storedLocation);
        setUserLocation(loc);
        
        const nearestCounty = getCountyByCoordinates(loc.lat, loc.lng);
        const nearestTown = getTownByCoordinates(loc.lat, loc.lng);
        
        if (nearestCounty) {
          setSelectedCounty(nearestCounty);
          setUserLocationDisplay({
            town: nearestTown?.name || nearestCounty.towns[0]?.name || 'Unknown',
            county: nearestCounty.name
          });
          setNotifications(generateNotifications(nearestCounty.id));
        }
      } else {
        setNotifications(generateNotifications());
      }
    }

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [profile]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    if (notification.countyId !== 'national') {
      const county = kenyaCounties.find(c => c.id === notification.countyId);
      if (county) {
        setSelectedCounty(county);
        setShowNotifications(false);
      }
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleReportSubmitted = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  // On mobile, sidebar is an overlay; on desktop, it pushes content
  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 64 : 320);

  const userCountyId = profile?.county_id || selectedCounty?.id || null;

  useRealtimeReports({
    countyId: userCountyId,
    isCountyAdmin,
    onNewReport: handleReportSubmitted,
  });

  // Resident notifications for admin replies and status changes
  const { unreadCount: residentUnread } = useResidentNotifications({
    userId: user?.id || null,
    enabled: !!user && !isCountyAdmin,
  });

  if (!dashboardReady) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background rain atmosphere */}
      <RainEffect dropCount={25} className="fixed inset-0 z-0 opacity-30" />
      {/* Header */}
      <DashboardHeader
        userLocation={userLocationDisplay}
        lastUpdate={lastUpdate}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationsClick={() => setShowNotifications(true)}
        onMenuClick={() => setMobileSidebarOpen(true)}
        showMenuButton={isMobile}
      />
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobileSidebarOpen(false)}
              />
              {/* Sidebar */}
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-[300px] z-50 bg-card border-r border-border overflow-y-auto"
              >
                <div className="pt-4">
                  <LeftSidebar
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    rainfall={rainfall}
                    consumption={consumption}
                    onRainfallChange={setRainfall}
                    onConsumptionChange={setConsumption}
                    showWeatherOverlay={showWeatherOverlay}
                    onWeatherOverlayChange={setShowWeatherOverlay}
                    showFloodOverlay={showFloodOverlay}
                    onFloodOverlayChange={setShowFloodOverlay}
                    selectedCounty={selectedCounty}
                    nationalStats={nationalStats}
                    isCollapsed={false}
                    onToggleCollapse={() => setMobileSidebarOpen(false)}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <LeftSidebar
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          rainfall={rainfall}
          consumption={consumption}
          onRainfallChange={setRainfall}
          onConsumptionChange={setConsumption}
          showWeatherOverlay={showWeatherOverlay}
          onWeatherOverlayChange={setShowWeatherOverlay}
          showFloodOverlay={showFloodOverlay}
          onFloodOverlayChange={setShowFloodOverlay}
          selectedCounty={selectedCounty}
          nationalStats={nationalStats}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
      
      {/* Main Content */}
      <main 
        className="pt-16 transition-all duration-300"
        style={{ 
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)` 
        }}
      >
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {user && (
              <Button
                onClick={() => setShowReportForm(true)}
                className="gap-2"
                variant="hero"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="w-4 h-4" />
                Submit Report
              </Button>
            )}
            
            {user && !isCountyAdmin && (
              <Button
                onClick={() => setShowMyReports(true)}
                variant="outline"
                className="gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <FileText className="w-4 h-4" />
                My Reports
              </Button>
            )}
            
            {isCountyAdmin && (
              <Button
                onClick={() => setShowAdminDashboard(true)}
                variant="outline"
                className="gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Button>
            )}
            
            {!user && (
              <>
                <Button
                  onClick={() => setShowDemoForm(true)}
                  className="gap-2"
                  variant="hero"
                  size={isMobile ? "sm" : "default"}
                >
                  <Beaker className="w-4 h-4" />
                  Try Demo Report
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="gap-2"
                  size={isMobile ? "sm" : "default"}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Sign in to submit reports
                </Button>
              </>
            )}
            {/* Alert Thresholds */}
            <Button
              onClick={() => setShowAlertThresholds(true)}
              variant="outline"
              className="gap-2"
              size={isMobile ? "sm" : "default"}
            >
              <Bell className="w-4 h-4" />
              Alerts
            </Button>
          </div>
          
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] relative"
          >
            <RainEffect dropCount={40} className="z-10 opacity-60" />
            <EnhancedKenyaMap
              counties={kenyaCounties}
              onCountySelect={setSelectedCounty}
              selectedCounty={selectedCounty}
              userLocation={userLocation}
              showWeatherOverlay={showWeatherOverlay}
              showFloodOverlay={showFloodOverlay}
              simulationRainfall={rainfall}
              simulationConsumption={consumption}
            />
            
            <ReportMarkers countyId={userCountyId || undefined} />
          </motion.div>
        </div>
      </main>

      {/* Right Details Panel */}
      {selectedCounty && (
        <RightDetailsPanel 
          county={selectedCounty} 
          onClose={() => setSelectedCounty(null)} 
        />
      )}
      
      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllRead}
      />
      
      {/* Report Form Modal */}
      <ReportForm
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        userLocation={userLocation}
        userCountyId={userCountyId}
        onReportSubmitted={handleReportSubmitted}
      />
      
      {/* Admin Dashboard */}
      {isCountyAdmin && userCountyId && (
        <AdminDashboard
          isOpen={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
          userCountyId={userCountyId}
        />
      )}
      
      {/* My Reports */}
      {user && (
        <MyReports
          isOpen={showMyReports}
          onClose={() => setShowMyReports(false)}
        />
      )}

      {/* Demo Report Form */}
      <DemoReportForm
        isOpen={showDemoForm}
        onClose={() => setShowDemoForm(false)}
        demoCountyId={selectedCounty?.id || 'kakamega'}
      />

      {/* Alert Thresholds */}
      <AlertThresholds
        isOpen={showAlertThresholds}
        onClose={() => setShowAlertThresholds(false)}
      />
    </div>
  );
};

export default Dashboard;
