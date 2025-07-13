import { useState } from 'react';
import { Scale, Activity, Droplets, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BluetoothScaleConnection } from './BluetoothScaleConnection';

interface AddDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddDataDialog = ({ open, onOpenChange }: AddDataDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    muscle: '',
    hydration: '',
    visceralFat: '',
    bone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Here you would typically save to a database
    toast({
      title: "Dados salvos com sucesso!",
      description: "Suas métricas foram registradas.",
    });
    onOpenChange(false);
    setFormData({
      weight: '',
      bodyFat: '',
      muscle: '',
      hydration: '',
      visceralFat: '',
      bone: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="add-data-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Adicionar Métricas de Saúde
          </DialogTitle>
          <DialogDescription id="add-data-description">
            Conecte sua balança Xiaomi via Bluetooth ou insira dados manualmente para registrar suas medições de saúde.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="bluetooth" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bluetooth">Balança Xiaomi</TabsTrigger>
            <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="bluetooth" className="space-y-4">
            <BluetoothScaleConnection />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    Peso Corporal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="75.2"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-secondary" />
                    Gordura Corporal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="bodyFat">Gordura (%)</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      step="0.1"
                      placeholder="18.5"
                      value={formData.bodyFat}
                      onChange={(e) => handleInputChange('bodyFat', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-wellness-green" />
                    Massa Muscular
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="muscle">Músculo (%)</Label>
                    <Input
                      id="muscle"
                      type="number"
                      step="0.1"
                      placeholder="45.8"
                      value={formData.muscle}
                      onChange={(e) => handleInputChange('muscle', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-primary" />
                    Hidratação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="hydration">Água (%)</Label>
                    <Input
                      id="hydration"
                      type="number"
                      step="0.1"
                      placeholder="62.3"
                      value={formData.hydration}
                      onChange={(e) => handleInputChange('hydration', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Gordura Visceral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="visceralFat">Nível</Label>
                    <Input
                      id="visceralFat"
                      type="number"
                      step="1"
                      placeholder="8"
                      value={formData.visceralFat}
                      onChange={(e) => handleInputChange('visceralFat', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Massa Óssea</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="bone">Osso (kg)</Label>
                    <Input
                      id="bone"
                      type="number"
                      step="0.1"
                      placeholder="3.2"
                      value={formData.bone}
                      onChange={(e) => handleInputChange('bone', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="health-button">
                Salvar Dados
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};