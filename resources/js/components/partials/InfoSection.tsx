import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Info, 
  FileText, 
  Shield, 
  Bug, 
  LogOut, 
  Moon, 
  Sun, 
  CheckCircle, 
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  User,
  Mail,
  MessageSquare,
  Zap,
  Layers,
  Palette,
  Sparkles
} from "lucide-react";

interface InfoSectionProps {
  appVersion?: string;
  onLogout?: () => void;
  onBugReport?: (data: { title: string; description: string; email: string }) => void;
  className?: string;
}

export function InfoSection({ 
  appVersion = "2.1.0", 
  onLogout, 
  onBugReport,
  className = ""
}: InfoSectionProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [bugReportData, setBugReportData] = useState({
    title: "",
    description: "",
    email: ""
  });

  const handleBugReport = () => {
    if (onBugReport) {
      onBugReport(bugReportData);
      setBugReportData({ title: "", description: "", email: "" });
      setBugReportOpen(false);
    }
  };

  const infoItems = [
    {
      icon: Info,
      title: "Version de l'app",
      value: appVersion,
      color: "text-blue-500",
      gradient: "from-blue-400/20 to-blue-600/20"
    },
    {
      icon: FileText,
      title: "Mentions légales",
      action: () => window.open("/legal-notice", "_blank"),
      color: "text-green-500",
      gradient: "from-green-400/20 to-green-600/20"
    },
    {
      icon: Shield,
      title: "Politique de confidentialité",
      action: () => window.open("/privacy", "_blank"),
      color: "text-purple-500",
      gradient: "from-purple-400/20 to-purple-600/20"
    },
    {
      icon: Bug,
      title: "Signaler un bug",
      action: () => setBugReportOpen(true),
      color: "text-red-500",
      gradient: "from-red-400/20 to-red-600/20"
    }
  ];

  return (
    <div className={`w-full h-full min-h-screen p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full">
        {/* Carte d'informations principales */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-md dark:backdrop-blur-lg transition-all duration-300 hover:shadow-2xl h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10 pointer-events-none"></div>
          
          {/* Éléments décoratifs */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl dark:bg-blue-400/10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl dark:bg-purple-400/10"></div>
          
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Layers className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                Informations
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm"
                aria-label="Basculer le thème"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
            <CardDescription className="text-sm md:text-base">
              Paramètres et informations sur l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4 flex-grow">
            {infoItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group border border-transparent hover:border-slate-200/50 dark:hover:border-slate-600/50"
                onClick={item.action}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${item.gradient} ${item.color}`}>
                    <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base md:text-lg">{item.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-base md:text-lg font-medium">{item.value}</span>
                  )}
                  {item.action && (
                    <ExternalLink className="h-5 w-5 md:h-6 md:w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Carte d'actions */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-md dark:backdrop-blur-lg transition-all duration-300 hover:shadow-2xl h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 dark:from-orange-400/10 dark:via-transparent dark:to-red-400/10 pointer-events-none"></div>
          
          {/* Éléments décoratifs */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl dark:bg-orange-400/10"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-red-500/10 rounded-full blur-3xl dark:bg-red-400/10"></div>
          
          <CardHeader className="relative z-10 pb-4">
            <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <Zap className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              Actions rapides
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Gérez votre compte et votre expérience
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6 flex-grow flex flex-col">
            {/* Bouton de déconnexion */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-red-200/70 text-red-600 hover:bg-red-50/70 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/30 backdrop-blur-sm text-base md:text-lg py-3 md:py-4"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 md:h-6 md:w-6" />
              Déconnexion
            </Button>

            {/* Informations supplémentaires */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex-grow">
              <h4 className="font-semibold text-base md:text-lg mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 md:h-6 md:w-6" />
                Besoin d'aide ?
              </h4>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto p-4 hover:bg-slate-100/70 dark:hover:bg-slate-700/50"
                  onClick={() => window.open("/help", "_blank")}
                >
                  <ExternalLink className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-base md:text-lg">Centre d'aide</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto p-4 hover:bg-slate-100/70 dark:hover:bg-slate-700/50"
                  onClick={() => window.open("mailto:privacy@maliyaflow.com")}
                >
                  <Mail className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-base md:text-lg">Contacter le support</div>
                    <div className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                      privacy@maliyaflow.com
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Statistiques de l'application */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <h4 className="font-semibold text-base md:text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                Application
              </h4>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100/50 dark:bg-slate-700/30 backdrop-blur-sm">
                <span className="text-base md:text-lg">Version</span>
                <Badge variant="outline" className="text-sm md:text-base py-1 px-2">{appVersion}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog pour le rapport de bug */}
      <Dialog open={bugReportOpen} onOpenChange={setBugReportOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-800/80 dark:backdrop-blur-lg dark:border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white">
                <Bug className="h-5 w-5" />
              </div>
              Signaler un bug
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Décrivez le problème que vous rencontrez pour nous aider à l'améliorer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm md:text-base">Titre du bug</Label>
              <Input
                id="title"
                placeholder="Ex: Le bouton ne fonctionne pas"
                value={bugReportData.title}
                onChange={(e) => setBugReportData({...bugReportData, title: e.target.value})}
                className="text-sm md:text-base py-2"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez en détail ce qui s'est passé..."
                value={bugReportData.description}
                onChange={(e) => setBugReportData({...bugReportData, description: e.target.value})}
                className="text-sm md:text-base min-h-[100px] py-2"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm md:text-base">Votre email (optionnel)</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={bugReportData.email}
                onChange={(e) => setBugReportData({...bugReportData, email: e.target.value})}
                className="text-sm md:text-base py-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBugReportOpen(false)} className="text-sm md:text-base py-2">
              Annuler
            </Button>
            <Button onClick={handleBugReport} disabled={!bugReportData.title || !bugReportData.description} className="text-sm md:text-base py-2">
              Envoyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
