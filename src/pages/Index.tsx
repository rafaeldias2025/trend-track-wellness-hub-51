import { useState } from 'react';
import { Plus, Activity, TrendingUp, User, Calendar, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { AddDataDialog } from '@/components/AddDataDialog';
import { ProgressChart } from '@/components/ProgressChart';
import { Header } from '@/components/Header';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { HeroSection } from '@/components/HeroSection';
import { ScaleDataHistory } from '@/components/ScaleDataHistory';

// Mock data for demonstration
const mockMetrics = {
  weight: { value: 75.2, unit: 'kg', change: -0.5, trend: 'down' as const },
  bmi: { value: 23.4, unit: '', change: -0.2, trend: 'down' as const },
  bodyFat: { value: 18.5, unit: '%', change: -1.2, trend: 'down' as const },
  muscle: { value: 45.8, unit: '%', change: 0.8, trend: 'up' as const },
  hydration: { value: 62.3, unit: '%', change: 2.1, trend: 'up' as const },
  visceralFat: { value: 8, unit: '', change: -1, trend: 'down' as const }
};

const mockWeightHistory = [
  { date: '2024-01-01', weight: 76.8 },
  { date: '2024-01-08', weight: 76.2 },
  { date: '2024-01-15', weight: 75.9 },
  { date: '2024-01-22', weight: 75.6 },
  { date: '2024-01-29', weight: 75.2 }
];

const Index = () => {
  const [showAddData, setShowAddData] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <HeroSection onAddData={() => setShowAddData(true)} />
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Olá, João! 👋
            </h1>
            <p className="text-muted-foreground">
              Vamos acompanhar seu progresso de saúde hoje
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ProfileSwitcher />
            <Button 
              onClick={() => setShowAddData(true)}
              className="health-button flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Dados
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Peso"
            value={mockMetrics.weight.value}
            unit={mockMetrics.weight.unit}
            change={mockMetrics.weight.change}
            trend={mockMetrics.weight.trend}
            icon={Scale}
            className="metric-card-primary"
          />
          
          <MetricCard
            title="IMC"
            value={mockMetrics.bmi.value}
            unit={mockMetrics.bmi.unit}
            change={mockMetrics.bmi.change}
            trend={mockMetrics.bmi.trend}
            icon={Activity}
          />
          
          <MetricCard
            title="Gordura Corporal"
            value={mockMetrics.bodyFat.value}
            unit={mockMetrics.bodyFat.unit}
            change={mockMetrics.bodyFat.change}
            trend={mockMetrics.bodyFat.trend}
            icon={TrendingUp}
          />
          
          <MetricCard
            title="Massa Muscular"
            value={mockMetrics.muscle.value}
            unit={mockMetrics.muscle.unit}
            change={mockMetrics.muscle.change}
            trend={mockMetrics.muscle.trend}
            icon={Activity}
            className="metric-card-secondary"
          />
          
          <MetricCard
            title="Hidratação"
            value={mockMetrics.hydration.value}
            unit={mockMetrics.hydration.unit}
            change={mockMetrics.hydration.change}
            trend={mockMetrics.hydration.trend}
            icon={Activity}
          />
          
          <MetricCard
            title="Gordura Visceral"
            value={mockMetrics.visceralFat.value}
            unit={mockMetrics.visceralFat.unit}
            change={mockMetrics.visceralFat.change}
            trend={mockMetrics.visceralFat.trend}
            icon={Activity}
          />
        </div>

        {/* Progress Chart */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progresso do Peso (Últimas 4 semanas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={mockWeightHistory} />
          </CardContent>
        </Card>

        {/* Recent Activity & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScaleDataHistory />

          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Metas & Objetivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meta de peso: 74 kg</span>
                  <span className="text-primary font-medium">84% concluída</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary w-[84%] rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gordura corporal: &lt;15%</span>
                  <span className="text-secondary font-medium">74% concluída</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-secondary w-[74%] rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Massa muscular: 48%</span>
                  <span className="text-wellness-green font-medium">62% concluída</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-wellness-green w-[62%] rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AddDataDialog open={showAddData} onOpenChange={setShowAddData} />
    </div>
  );
};

export default Index;
