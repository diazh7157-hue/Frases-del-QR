import { useState } from "react";
import { usePhrases, useCreatePhrase, useDeletePhrase } from "@/hooks/use-phrases";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPhraseSchema, type InsertPhrase } from "@shared/schema";
import { QRCodeSVG } from "qrcode.react";
import { Trash2, Plus, QrCode, ExternalLink, Sparkles, Copy, Check } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const { data: phrases, isLoading } = usePhrases();
  const createPhrase = useCreatePhrase();
  const deletePhrase = useDeletePhrase();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const form = useForm<InsertPhrase>({
    resolver: zodResolver(insertPhraseSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = (data: InsertPhrase) => {
    createPhrase.mutate(data, {
      onSuccess: () => {
        form.reset();
        toast({
          title: "Phrase Added",
          description: "Your new phrase is now in the rotation.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  const handleDelete = (id: number) => {
    deletePhrase.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Deleted",
          description: "Phrase removed from rotation.",
        });
      },
    });
  };

  const publicUrl = `${window.location.origin}/view`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col items-center text-center space-y-2 mb-12">
          <h2 className="text-4xl font-bold text-primary tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>Ruth Indumentaria Modesta</h2>
          <div className="h-1 w-24 bg-primary/20 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Management */}
        <div className="lg:col-span-7 space-y-8">
          <header className="space-y-2 mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Generador de <span className="text-gradient-primary">Frases</span><br />Aleatorias
            </h1>
            <p className="text-muted-foreground text-lg">
              Gestiona el conjunto de sabiduría entregado vía código QR.
            </p>
          </header>

          <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-3 text-primary mb-2">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-xl font-bold font-display text-foreground">Añadir Nueva Frase</h2>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Escribe algo inspirador, divertido o misterioso..." 
                          className="bg-secondary/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 min-h-[120px] text-lg resize-none rounded-xl"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <ShinyButton type="submit" isLoading={createPhrase.isPending}>
                    <Plus className="w-4 h-4" /> Añadir a la Rotación
                  </ShinyButton>
                </div>
              </form>
            </Form>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold font-display text-foreground/80 px-1">Frases Activas ({phrases?.length || 0})</h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-card/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : phrases?.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02]">
                <p className="text-muted-foreground">Aún no hay frases. ¡Añade la primera arriba!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {phrases?.map((phrase) => (
                  <div 
                    key={phrase.id} 
                    className="group flex items-start justify-between gap-4 p-5 rounded-xl bg-card border border-primary/10 hover:border-primary/30 transition-all hover:bg-card/80"
                  >
                    <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                      "{phrase.text}"
                    </p>
                    <button
                      onClick={() => handleDelete(phrase.id)}
                      disabled={deletePhrase.isPending}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Eliminar frase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: QR Code (Sticky on Desktop) */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-6">
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center space-y-8 border-primary/20 shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-2">
                  <QrCode className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground">Punto de Acceso en Vivo</h2>
                <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                  Escanea para revelar una frase aleatoria de tu colección.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-xl transform transition-transform hover:scale-105 duration-300">
                <QRCodeSVG 
                  value={publicUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-2 w-full p-2 pl-4 rounded-xl bg-secondary/50 border border-white/10 text-sm text-muted-foreground">
                  <span className="truncate flex-1 font-mono text-xs">{publicUrl}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                    title="Copiar Enlace"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <Link href="/view" className="block w-full">
                  <ShinyButton variant="secondary" className="w-full group">
                    Visitar Página Pública <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </ShinyButton>
                </Link>
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
