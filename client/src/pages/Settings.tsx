import { useState } from "react";
import { 
  FolderSync, Calendar, CheckSquare, BellRing, 
  Shield, CreditCard, HelpCircle, LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const isMobile = useMobile();
  const { toast } = useToast();
  
  // Setting states
  const [cloudSync, setCloudSync] = useState(true);
  const [taxYear, setTaxYear] = useState("january");
  const [turbotaxConnected, setTurbotaxConnected] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [categoryReminders, setCategoryReminders] = useState(true);
  
  // Handle save settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  return (
    <div className={isMobile ? "p-5 pb-20" : "p-8"}>
      <header className="mb-6">
        <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-semibold text-neutral-800`}>Settings</h2>
        <p className="text-neutral-500 text-sm mt-1">Manage your account preferences</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sync & Integration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Sync & Integrations</CardTitle>
            <CardDescription>
              Connect with other services and manage your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 mr-3">
                  <FolderSync className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Cloud Sync</p>
                  <p className="text-sm text-neutral-500">Backup your expenses to the cloud</p>
                </div>
              </div>
              <Switch checked={cloudSync} onCheckedChange={setCloudSync} />
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center text-green-500 mr-3">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Tax Year Start Month</p>
                  <p className="text-sm text-neutral-500">Set when your tax year begins</p>
                </div>
              </div>
              
              <RadioGroup 
                defaultValue="january" 
                value={taxYear}
                onValueChange={setTaxYear}
                className="grid grid-cols-2 md:grid-cols-4 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="january" id="january" />
                  <Label htmlFor="january">January</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="april" id="april" />
                  <Label htmlFor="april">April</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="july" id="july" />
                  <Label htmlFor="july">July</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="october" id="october" />
                  <Label htmlFor="october">October</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center text-purple-500 mr-3">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Connect to TurboTax</p>
                  <p className="text-sm text-neutral-500">Easily export deductions at tax time</p>
                </div>
              </div>
              <Button variant={turbotaxConnected ? "outline" : "default"} onClick={() => setTurbotaxConnected(!turbotaxConnected)}>
                {turbotaxConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-neutral-500">Weekly expense summaries</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-neutral-500">New tax tip alerts</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Category Reminders</p>
                <p className="text-sm text-neutral-500">Remind me to categorize expenses</p>
              </div>
              <Switch checked={categoryReminders} onCheckedChange={setCategoryReminders} />
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input defaultValue="Mike Johnson" />
            </div>
            
            <div>
              <Label>Email Address</Label>
              <Input defaultValue="mike@example.com" />
            </div>
            
            <div>
              <Label>Password</Label>
              <Input type="password" value="••••••••" />
            </div>
            
            <Button className="w-full">Update Profile</Button>
          </CardContent>
        </Card>
        
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
            <CardDescription>
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-neutral-500">Use dark theme</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            
            <Separator />
            
            <div>
              <Label className="mb-2 block">Currency Format</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="cad">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>
              Secure your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center text-red-500 mr-3">
                  <Shield className="h-4 w-4" />
                </div>
                <p className="font-medium">Two-Factor Authentication</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-yellow-50 flex items-center justify-center text-yellow-500 mr-3">
                  <CreditCard className="h-4 w-4" />
                </div>
                <p className="font-medium">Data Export</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                  <LogOut className="h-4 w-4" />
                </div>
                <p className="font-medium">Sign Out</p>
              </div>
              <Button variant="ghost" size="sm" className="text-red-500">Logout</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Support & Help */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Help & Support</CardTitle>
            <CardDescription>
              Get help with your account and app usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <HelpCircle className="h-5 w-5 mr-2 text-neutral-700" />
                  <h3 className="font-medium">FAQs</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-3">Find answers to common questions about using DeduX.</p>
                <Button variant="outline" size="sm">View FAQs</Button>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <MessageSquare className="h-5 w-5 mr-2 text-neutral-700" />
                  <h3 className="font-medium">Contact Support</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-3">Reach out to our team for personalized assistance.</p>
                <Button variant="outline" size="sm">Contact Us</Button>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 mr-2 text-neutral-700" />
                  <h3 className="font-medium">Knowledge Base</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-3">Learn more about tax deductions for freelancers.</p>
                <Button variant="outline" size="sm">Read Articles</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveSettings}>Save All Settings</Button>
      </div>
    </div>
  );
}

// Add missing icons for the Support & Help section
function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
