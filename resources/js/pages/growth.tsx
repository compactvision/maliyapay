import AdviceTab from '@/components/growth/AdviceTab';
import BusinessGameTab from '@/components/growth/BusinessGameTab';
import RoutinesTab from '@/components/growth/RoutinesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import { ListTodo, Sparkles, Target, Trophy } from 'lucide-react';

const Growth = () => {
    return (
        <AppLayout>
            <div className="container mx-auto max-w-7xl space-y-8 p-4 md:p-6">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white shadow-xl">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="h-6 w-6 animate-pulse text-yellow-300" />
                            <h1 className="text-3xl font-bold tracking-tight">
                                Zone de Croissance
                            </h1>
                        </div>
                        <p className="max-w-xl text-lg text-purple-100">
                            Développez votre potentiel financier,, établissez
                            des routines gagnantes et bâtissez votre empire.
                        </p>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 opacity-50 blur-3xl"></div>
                    <div className="pointer-events-none absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-blue-500/20 opacity-50 blur-2xl"></div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="advice" className="w-full space-y-6">
                    <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted/50 p-1">
                        <TabsTrigger
                            value="advice"
                            className="rounded-lg py-3 transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <div className="flex flex-col items-center gap-2 md:flex-row">
                                <ListTodo className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="text-xs font-medium md:text-sm">
                                    Conseils & Tâches
                                </span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="routines"
                            className="rounded-lg py-3 transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <div className="flex flex-col items-center gap-2 md:flex-row">
                                <Target className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="text-xs font-medium md:text-sm">
                                    Routines
                                </span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="business"
                            className="rounded-lg py-3 transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <div className="flex flex-col items-center gap-2 md:flex-row">
                                <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="text-xs font-medium md:text-sm">
                                    Business Game
                                </span>
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="advice"
                        className="focus-visible:ring-0 focus-visible:outline-none"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AdviceTab />
                        </motion.div>
                    </TabsContent>

                    <TabsContent
                        value="routines"
                        className="focus-visible:ring-0 focus-visible:outline-none"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <RoutinesTab />
                        </motion.div>
                    </TabsContent>

                    <TabsContent
                        value="business"
                        className="focus-visible:ring-0 focus-visible:outline-none"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BusinessGameTab />
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default Growth;
