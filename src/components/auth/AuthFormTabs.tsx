
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthFormTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function AuthFormTabs({ activeTab, onTabChange }: AuthFormTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 backdrop-blur-sm border border-white/10">
      <TabsTrigger 
        value="signin" 
        className="data-[state=active]:bg-figuro-accent data-[state=active]:text-white transition-all duration-300"
      >
        Sign In
      </TabsTrigger>
      <TabsTrigger 
        value="signup"
        className="data-[state=active]:bg-figuro-accent data-[state=active]:text-white transition-all duration-300"
      >
        Sign Up
      </TabsTrigger>
    </TabsList>
  );
}
