import { useEffect, useState } from 'react';
import { Calendar, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScaleReading {
  id: string;
  peso_kg: number;
  imc?: number;
  gordura_corporal_pct?: number;
  agua_corporal_pct?: number;
  massa_muscular_kg?: number;
  massa_ossea_kg?: number;
  taxa_metabolica_basal?: number;
  idade_metabolica?: number;
  gordura_visceral?: number;
  tipo_corpo?: string;
  origem_medicao: string;
  data_medicao: string;
  created_at: string;
}

export const ScaleDataHistory = () => {
  const [readings, setReadings] = useState<ScaleReading[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('pesagens')
        .select('*')
        .eq('user_id', profile.id)
        .order('data_medicao', { ascending: false })
        .limit(5);

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar o histórico de pesagens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTrend = (currentIndex: number) => {
    if (currentIndex >= readings.length - 1) return null;
    
    const current = readings[currentIndex].peso_kg;
    const previous = readings[currentIndex + 1].peso_kg;
    const difference = current - previous;
    
    if (Math.abs(difference) < 0.1) return null;
    
    return {
      direction: difference > 0 ? 'up' : 'down',
      value: Math.abs(difference).toFixed(1),
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Histórico de Medições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (readings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Histórico de Medições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma medição registrada ainda.</p>
            <p className="text-sm">Conecte sua balança para começar!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Histórico de Medições ({readings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {readings.map((reading, index) => {
          const trend = getTrend(index);
          
          return (
            <div key={reading.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(reading.data_medicao)}
                  </span>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {reading.origem_medicao}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold">
                    {reading.peso_kg.toFixed(1)} kg
                  </div>
                  {reading.imc && (
                    <div className="text-xs text-muted-foreground">
                      IMC: {reading.imc.toFixed(1)}
                    </div>
                  )}
                </div>

                {trend && (
                  <div className={`flex items-center gap-1 text-xs ${
                    trend.direction === 'down' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {trend.direction === 'down' ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {trend.value}kg
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {readings.length === 5 && (
          <div className="text-center pt-2">
            <span className="text-xs text-muted-foreground">
              Exibindo as 5 medições mais recentes
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};