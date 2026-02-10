import { useRandomPhrase } from "@/hooks/use-phrases";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Loader2, RefreshCw, Quote, Flower2, Leaf } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const FallingElements = () => {
  const [elements, setElements] = useState<{ id: number; left: string; delay: string; duration: string; type: 'flower' | 'leaf'; size: string; color: string }[]>([]);

  useEffect(() => {
    const flowerColors = [
      'text-pink-400', 
      'text-rose-400', 
      'text-orange-300', 
      'text-yellow-400', 
      'text-purple-400',
      'text-red-400'
    ];

    const newElements = Array.from({ length: 30 }).map((_, i) => {
      const isLeaf = Math.random() > 0.6;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 20}s`,
        duration: `${12 + Math.random() * 12}s`,
        type: isLeaf ? 'leaf' : 'flower' as const,
        size: `${14 + Math.random() * 14}px`,
        color: isLeaf ? 'text-green-500/40' : flowerColors[Math.floor(Math.random() * flowerColors.length)] + '/40'
      };
    });
    setElements(newElements);
  }, []);

  return (
    <>
      {elements.map((el) => (
        <div
          key={el.id}
          className="falling-element"
          style={{
            left: el.left,
            animationDelay: el.delay,
            animationDuration: el.duration,
          }}
        >
          {el.type === 'flower' ? (
            <Flower2 style={{ width: el.size, height: el.size }} className={el.color} />
          ) : (
            <Leaf style={{ width: el.size, height: el.size }} className={el.color} />
          )}
        </div>
      ))}
    </>
  );
};

export default function PublicView() {
  const { data: phrase, isLoading, isError, refetch, isRefetching } = useRandomPhrase();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    // Force a hard refetch ignoring cache to ensure randomness
    await queryClient.invalidateQueries({ queryKey: [api.phrases.random.path] });
    refetch();
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <FallingElements />
      <div className="absolute top-8 left-0 w-full flex flex-col items-center text-center space-y-1">
        <h2 className="text-xl font-bold text-primary tracking-widest uppercase italic">Ruth Indumentaria Modesta</h2>
        <div className="h-0.5 w-16 bg-primary/20 rounded-full" />
      </div>

      {/* Abstract Background Decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />

      <main className="relative z-10 w-full max-w-2xl text-center space-y-12">
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-full bg-secondary/30 border border-white/5 backdrop-blur-sm">
            <Quote className="w-8 h-8 text-primary opacity-80" />
          </div>
        </div>

        <div className="min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isLoading || isRefetching ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 text-muted-foreground"
              >
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm tracking-widest uppercase font-semibold">Consulting the Oracle...</p>
              </motion.div>
            ) : isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive font-medium"
              >
                Unable to fetch a message. The spirits are silent.
              </motion.div>
            ) : !phrase ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-3xl font-display font-bold text-white/50">Void</h2>
                <p className="text-muted-foreground">The database is empty. Ask the admin to add some wisdom.</p>
              </motion.div>
            ) : (
              <motion.div
                key={phrase.id}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight text-gradient tracking-tight">
                  "{phrase.text}"
                </h1>
                <p className="text-sm font-mono text-primary/40 uppercase tracking-widest">
                  Message ID: #{phrase.id.toString().padStart(4, '0')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-12">
          <ShinyButton 
            onClick={handleRefresh} 
            disabled={isLoading || isRefetching}
            className="w-full sm:w-auto min-w-[200px]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Another One
          </ShinyButton>
        </div>
      </main>

      <footer className="absolute bottom-6 text-xs text-white/10 font-mono">
        QR Random Phrase Generator &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
