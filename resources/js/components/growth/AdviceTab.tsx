import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTasks } from '@/hooks/useTasks';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { useEffect } from 'react';

import { useGrowth } from '@/hooks/useGrowth';

const AdviceTab = () => {
    const { tasks, refetch: fetchTasks } = useTasks();
    const { advices, isLoading: growthLoading } = useGrowth();

    useEffect(() => {
        fetchTasks();
    }, []);

    const defaultAdvices = [
        {
            id: '1',
            title: "L'importance de l'épargne de précaution",
            summary:
                'Découvrez pourquoi avoir 3 à 6 mois de dépenses de côté est crucial pour votre sérénité financière.',
            category: 'Épargne',
            publishedAt: '23 Déc 2025',
        },
        {
            id: '2',
            title: 'Investir tôt : Le pouvoir des intérêts composés',
            summary:
                "Commencer petit aujourd'hui peut rapporter gros demain grâce à l'effet boule de neige.",
            category: 'Investissement',
            publishedAt: '22 Déc 2025',
        },
        {
            id: '3',
            title: 'Gérer son budget avec la règle 50/30/20',
            summary:
                'Une méthode simple pour répartir vos revenus entre besoins, envies et épargne.',
            category: 'Budget',
            publishedAt: '20 Déc 2025',
        },
    ];

    const displayAdvices = advices.length > 0 ? advices : defaultAdvices;

    return (
        <div className="space-y-6">
            <section>
                <h3 className="mb-4 text-xl font-bold text-foreground">
                    Conseils Financiers
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {growthLoading
                        ? [1, 2, 3].map((i) => (
                              <Card
                                  key={i}
                                  className="h-32 animate-pulse bg-muted/50"
                              />
                          ))
                        : displayAdvices.map((news) => (
                              <motion.div
                                  key={news.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                              >
                                  <Card className="h-full border-primary/10 transition-shadow duration-300 hover:shadow-lg">
                                      <CardHeader>
                                          <div className="mb-2 flex items-start justify-between">
                                              <Badge
                                                  variant="outline"
                                                  className="bg-primary/5"
                                              >
                                                  {news.category}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground">
                                                  {news.publishedAt
                                                      ? new Date(
                                                            news.publishedAt,
                                                        ).toLocaleDateString()
                                                      : 'Nouveau'}
                                              </span>
                                          </div>
                                          <CardTitle className="text-lg leading-tight">
                                              {news.title}
                                          </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                          <CardDescription>
                                              {news.summary}
                                          </CardDescription>
                                      </CardContent>
                                  </Card>
                              </motion.div>
                          ))}
                </div>
            </section>

            <section>
                <h3 className="mb-4 text-xl font-bold text-foreground">
                    Vos Tâches en Attente
                </h3>
                <Card className="border-0 bg-transparent shadow-none">
                    <ScrollArea className="h-[300px] w-full rounded-md border bg-card/50 p-4 backdrop-blur-sm">
                        {tasks && tasks.length > 0 ? (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center space-x-4 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                                        ) : (
                                            <Circle className="h-6 w-6 text-muted-foreground" />
                                        )}
                                        <div className="flex-1 space-y-1">
                                            <p className="leading-none font-medium">
                                                {task.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {task.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                <p>Aucune tâche en attente pour le moment.</p>
                            </div>
                        )}
                    </ScrollArea>
                </Card>
            </section>
        </div>
    );
};

export default AdviceTab;
