import { Bluetooth, Smartphone, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/health-hero.jpg';

interface HeroSectionProps {
  onAddData: () => void;
}

export const HeroSection = ({ onAddData }: HeroSectionProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-wellness">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`
        }}
      />
      
      <div className="relative z-10 px-8 py-12 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">
                Controle sua saúde com precisão
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Conecte sua balança Bluetooth e acompanhe suas métricas de saúde 
                com gráficos detalhados e análises inteligentes.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={onAddData}
                size="lg"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20 font-semibold"
              >
                Começar Agora
              </Button>
              <Button 
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
              >
                Conectar Balança
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Bluetooth className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Bluetooth</h4>
                    <p className="text-sm text-white/80">Conexão automática</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Análises</h4>
                    <p className="text-sm text-white/80">Progresso detalhado</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Múltiplos Perfis</h4>
                    <p className="text-sm text-white/80">Família toda</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Sync</h4>
                    <p className="text-sm text-white/80">Dados seguros</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};