import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTasks } from '@/hooks/useTasks';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Eye, Image as ImageIcon } from 'lucide-react';
import { useEffect } from 'react';

import { useGrowth } from '@/hooks/useGrowth';
import { router } from '@inertiajs/react';

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
            images: [],
            readingTimeMinutes: 5,
            viewsCount: 0,
        },
        {
            id: '2',
            title: 'Investir tôt : Le pouvoir des intérêts composés',
            summary:
                "Commencer petit aujourd'hui peut rapporter gros demain grâce à l'effet boule de neige.",
            category: 'Investissement',
            publishedAt: '22 Déc 2025',
            images: [],
            readingTimeMinutes: 7,
            viewsCount: 0,
        },
        {
            id: '3',
            title: 'Gérer son budget avec la règle 50/30/20',
            summary:
                'Une méthode simple pour répartir vos revenus entre besoins, envies et épargne.',
            category: 'Budget',
            publishedAt: '20 Déc 2025',
            images: [],
            readingTimeMinutes: 4,
            viewsCount: 0,
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
                                  whileHover={{ y: -5 }}
                              >
                                  <Card
                                      onClick={() =>
                                          router.visit(
                                              `/growth/advice/${news.id}`,
                                          )
                                      }
                                      className="group relative h-full cursor-pointer overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-xl dark:bg-card/50"
                                  >
                                      {/* Cover Image */}
                                      <div className="relative h-48 w-full overflow-hidden">
                                          {news.images &&
                                          news.images.length > 0 ? (
                                              <img
                                                  src={news.images[0]}
                                                  alt={news.title}
                                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                              />
                                          ) : (
                                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                                                  <ImageIcon className="h-12 w-12 text-white/20" />
                                              </div>
                                          )}
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                                          <Badge
                                              variant="secondary"
                                              className="absolute top-4 left-4 border-white/20 bg-white/10 text-white backdrop-blur-md"
                                          >
                                              {news.category}
                                          </Badge>
                                      </div>

                                      <CardContent className="p-5">
                                          <CardTitle className="mb-2 text-lg leading-tight transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                              {news.title}
                                          </CardTitle>
                                          <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                                              {news.summary}
                                          </CardDescription>
                                      </CardContent>

                                      <div className="px-5 pb-5">
                                          <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                                              <span>
                                                  {news.publishedAt
                                                      ? new Date(
                                                            news.publishedAt,
                                                        ).toLocaleDateString()
                                                      : 'Récemment'}
                                              </span>
                                              <div className="flex items-center gap-3">
                                                  {news.viewsCount !==
                                                      undefined && (
                                                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                          <Eye className="h-3.5 w-3.5" />
                                                          <span className="font-medium">
                                                              {news.viewsCount}
                                                          </span>
                                                      </div>
                                                  )}
                                                  <span>
                                                      {news.readingTimeMinutes ||
                                                          5}{' '}
                                                      min
                                                  </span>
                                              </div>
                                          </div>
                                      </div>
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
