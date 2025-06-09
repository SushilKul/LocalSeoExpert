import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  BarChart3, 
  Star, 
  Megaphone, 
  Camera, 
  Search, 
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Locations",
    href: "/locations",
    icon: MapPin,
  },
  {
    name: "Reviews",
    href: "/reviews",
    icon: Star,
  },
  {
    name: "Posts",
    href: "/posts",
    icon: Megaphone,
  },
  {
    name: "Photos",
    href: "/photos",
    icon: Camera,
  },
  {
    name: "Keywords",
    href: "/keywords",
    icon: Search,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Help & Support",
    href: "/help",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col bg-sidebar-background border-r border-sidebar-border">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">LocalSEO Pro</h1>
              <p className="text-sm text-sidebar-foreground/60">GMB Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href === "/dashboard" && location === "/");
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}

          {/* Secondary Navigation */}
          <div className="pt-6 border-t border-sidebar-border">
            {secondaryNavigation.map((item) => {
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
            
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
