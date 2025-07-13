
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Bluetooth API type definitions
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }
  
  interface Bluetooth {
    requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
  }
  
  interface BluetoothRequestDeviceOptions {
    filters: BluetoothLEScanFilter[];
    optionalServices?: string[];
  }
  
  interface BluetoothLEScanFilter {
    name?: string;
    namePrefix?: string;
    services?: string[];
  }
  
  interface BluetoothDevice {
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
  }
  
  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
  }
  
  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }
  
  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    value?: DataView;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
  }
}

interface ScaleData {
  weight: number;
  impedance?: number;
  bodyFat?: number;
  water?: number;
  muscle?: number;
  boneMass?: number;
  bmr?: number;
  metabolicAge?: number;
  visceralFat?: number;
  bodyType?: string;
}

interface ParsedScaleData {
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
}

// OpenScale-based parser for Xiaomi Mi Scale (multiple versions supported)
class OpenScaleMiParser {
  // UUID constants from openScale
  static WEIGHT_MEASUREMENT_SERVICE = '0000181d-0000-1000-8000-00805f9b34fb';
  static WEIGHT_MEASUREMENT_HISTORY_CHARACTERISTIC = '00002a2f-0000-3512-2118-0009af100700';
  
  static parseAdvertisementData(manufacturerData: DataView): ScaleData | null {
    try {
      console.log('Parsing advertisement data, length:', manufacturerData.byteLength);
      
      if (manufacturerData.byteLength < 13) {
        console.log('Data too short, skipping');
        return null;
      }

      // OpenScale parsing logic for Xiaomi scales
      const data = new Uint8Array(manufacturerData.buffer);
      console.log('Raw data:', Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
      
      // Control byte analysis (from openScale)
      const ctrlByte0 = data[0];
      const ctrlByte1 = data[1];
      
      console.log('Control bytes:', ctrlByte0.toString(16), ctrlByte1.toString(16));
      
      // Check for weight measurement bit
      const hasWeight = (ctrlByte0 & 0x20) !== 0;
      const hasImpedance = (ctrlByte1 & 0x02) !== 0;
      const isStabilized = (ctrlByte0 & 0x40) !== 0;
      
      console.log('Flags - hasWeight:', hasWeight, 'hasImpedance:', hasImpedance, 'isStabilized:', isStabilized);
      
      if (!hasWeight) {
        console.log('No weight measurement, skipping');
        return null;
      }

      // Try multiple weight extraction methods (different scale versions)
      let weight = 0;
      
      // Method 1: Bytes 11-12 (most common for Mi Scale 2)
      const weightRaw1 = data[11] | (data[12] << 8);
      const weight1 = weightRaw1 / 200.0; // Updated to match display
      
      // Method 2: Different byte positions for older scales
      const weightRaw2 = data[1] | (data[2] << 8);
      const weight2 = weightRaw2 / 200.0; // Standard BLE format
      
      // Method 3: Alternative parsing
      const weightRaw3 = data[12] | (data[13] << 8);
      const weight3 = weightRaw3 / 200.0;
      
      console.log('Weight candidates:', weight1, weight2, weight3);
      
      // Choose the most reasonable weight
      const candidates = [weight1, weight2, weight3].filter(w => w >= 2 && w <= 300);
      
      if (candidates.length === 0) {
        console.log('No valid weight found');
        return null;
      }
      
      weight = candidates[0];
      console.log('Selected weight:', weight);

      const result: ScaleData = { weight: parseFloat(weight.toFixed(2)) };

      // Extract impedance if available (openScale algorithm)
      if (hasImpedance && data.length >= 13) {
        // Try different impedance extraction methods
        const impedanceRaw1 = data[9] | (data[10] << 8);
        const impedanceRaw2 = data[4] | (data[5] << 8);
        
        console.log('Impedance candidates:', impedanceRaw1, impedanceRaw2);
        
        const impedance = impedanceRaw1 > 0 && impedanceRaw1 < 3000 ? impedanceRaw1 : 
                         impedanceRaw2 > 0 && impedanceRaw2 < 3000 ? impedanceRaw2 : 0;
        
        if (impedance > 0) {
          console.log('Using impedance:', impedance);
          result.impedance = impedance;
          
          // OpenScale body composition calculation
          const bodyComposition = this.calculateBodyComposition(weight, impedance, isStabilized);
          Object.assign(result, bodyComposition);
        }
      }

      console.log('Final result:', result);
      return result;
    } catch (error) {
      console.error('OpenScale parser error:', error);
      return null;
    }
  }
  
  // Enhanced body composition calculation based on openScale algorithms
  static calculateBodyComposition(weight: number, impedance: number, isStabilized: boolean) {
    // Default user parameters (should ideally come from user profile)
    const age = 30;
    const height = 170; // cm
    const gender = 'male'; // male/female
    const activityLevel = 'normal';
    
    // OpenScale-based impedance to body fat calculation
    let bodyFat = 0;
    let water = 0;
    let muscle = 0;
    let boneMass = 0;
    let visceralFat = 0;
    let bmr = 0;
    let metabolicAge = 0;
    
    if (impedance > 0) {
      // Improved algorithm based on openScale research
      const bmi = weight / Math.pow(height / 100, 2);
      
      // Body fat calculation (enhanced openScale formula)
      if (gender === 'male') {
        bodyFat = (1.2 * bmi) + (0.23 * age) - (10.8 * 1) - 5.4 + (impedance * 0.01);
      } else {
        bodyFat = (1.2 * bmi) + (0.23 * age) - (10.8 * 0) - 5.4 + (impedance * 0.01);
      }
      
      // Clamp body fat percentage
      bodyFat = Math.max(5, Math.min(50, bodyFat));
      
      // Water percentage (openScale algorithm)
      water = gender === 'male' ? 
        (2.447 - (0.09156 * age) + (0.1074 * height) + (0.3362 * weight) - (0.09477 * impedance / 100)) :
        (0.296 + (0.192 * height) + (0.274 * weight) - (0.131 * impedance / 100));
      water = Math.max(35, Math.min(75, water));
      
      // Muscle mass (enhanced calculation)
      muscle = weight * (1 - bodyFat / 100) * 0.85;
      muscle = Math.max(10, Math.min(weight * 0.8, muscle));
      
      // Bone mass (openScale method)
      boneMass = gender === 'male' ? 
        (0.18016894 * height - 0.05262 * weight + 0.2796 * impedance / 100 - 6.50361) :
        (0.245691014 * height - 0.05262 * weight + 0.1645 * impedance / 100 - 5.1456);
      boneMass = Math.max(0.5, Math.min(8, boneMass));
      
      // Visceral fat (improved calculation)
      visceralFat = Math.max(1, Math.min(30, Math.round((bodyFat - 10) / 2.5)));
      
      // BMR calculation (Mifflin-St Jeor equation)
      bmr = gender === 'male' ?
        (10 * weight + 6.25 * height - 5 * age + 5) :
        (10 * weight + 6.25 * height - 5 * age - 161);
      
      // Metabolic age calculation
      const avgBMR = gender === 'male' ? 1680 : 1200;
      metabolicAge = Math.max(15, Math.min(80, Math.round(age * (avgBMR / bmr))));
    }
    
    // Body type classification (openScale categories)
    let bodyType = 'normal';
    if (bodyFat < 6) bodyType = 'muito magro';
    else if (bodyFat < 14) bodyType = 'atlético';
    else if (bodyFat < 21) bodyType = 'normal';
    else if (bodyFat < 30) bodyType = 'acima do peso';
    else bodyType = 'obesidade';
    
    return {
      bodyFat: parseFloat(bodyFat.toFixed(1)),
      water: parseFloat(water.toFixed(1)),
      muscle: parseFloat(muscle.toFixed(1)),
      boneMass: parseFloat(boneMass.toFixed(2)),
      bmr: Math.round(bmr),
      metabolicAge: Math.round(metabolicAge),
      visceralFat: Math.round(visceralFat),
      bodyType
    };
  }
}

export const useBluetoothScale = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [isWaitingToStep, setIsWaitingToStep] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [lastScaleData, setLastScaleData] = useState<ScaleData | null>(null);
  const [isShowingConfirmation, setIsShowingConfirmation] = useState(false);
  const { toast } = useToast();

  const calculateBMI = (weight: number, height: number): number => {
    return weight / Math.pow(height / 100, 2);
  };

  // Parser específico para Mi Body Composition Scale 2
  const parseMiScale2Data = (value: DataView): ScaleData | null => {
    try {
      console.log('Parseando dados Mi Scale 2, tamanho:', value.byteLength);
      
      const data = new Uint8Array(value.buffer);
      console.log('Raw data:', Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
      
      // Mi Body Composition Scale 2 format analysis
      if (data.length < 13) {
        console.log('Dados insuficientes para Mi Scale 2');
        return null;
      }
      
      // Weight extraction for Mi Scale 2 (different formats)
      let weight = 0;
      
      // Method 1: Standard BLE Weight Scale format (most accurate for Mi Scale 2)
      if (data.length >= 6) {
        const weightRaw = data[1] | (data[2] << 8);
        weight = weightRaw / 200.0; // kg with 0.005kg precision
        console.log('Weight method 1 (Standard BLE):', weight);
      }
      
      // Method 2: Xiaomi Mi Scale 2 specific format
      if ((weight <= 0 || weight > 300) && data.length >= 13) {
        const weightRaw = data[11] | (data[12] << 8);
        weight = weightRaw / 200.0; // Changed from 0.005 to match display
        console.log('Weight method 2 (Xiaomi format):', weight);
      }
      
      // Method 3: Alternative parsing (exact display match)
      if ((weight <= 0 || weight > 300) && data.length >= 10) {
        const weightRaw = data[8] | (data[9] << 8);
        weight = weightRaw / 200.0; // Consistent with display
        console.log('Weight method 3 (Alternative):', weight);
      }
      
      // Method 4: Direct weight reading (for some scale versions)
      if ((weight <= 0 || weight > 300) && data.length >= 4) {
        const weightRaw = data[2] | (data[3] << 8);
        weight = weightRaw / 100.0;
        console.log('Weight method 4 (Direct):', weight);
      }
      
      if (weight <= 0 || weight > 300) {
        console.log('Peso inválido após todos os métodos:', weight);
        return null;
      }
      
      const result: ScaleData = {
        weight: parseFloat(weight.toFixed(1))
      };
      
      // Try to extract impedance for body composition
      if (data.length >= 13) {
        let impedance = 0;
        
        // Try different impedance positions
        const imp1 = data[9] | (data[10] << 8);
        const imp2 = data[4] | (data[5] << 8);
        const imp3 = data[6] | (data[7] << 8);
        
        console.log('Impedance candidates:', imp1, imp2, imp3);
        
        // Choose valid impedance value
        if (imp1 > 0 && imp1 < 3000) impedance = imp1;
        else if (imp2 > 0 && imp2 < 3000) impedance = imp2;
        else if (imp3 > 0 && imp3 < 3000) impedance = imp3;
        
        if (impedance > 0) {
          console.log('Using impedance:', String(impedance));
          result.impedance = impedance;
          
          // Calculate body composition using OpenScale algorithm
          const bodyComposition = OpenScaleMiParser.calculateBodyComposition(weight, impedance, true);
          Object.assign(result, bodyComposition);
        }
      }
      
      console.log('Mi Scale 2 result:', result);
      return result;
      
    } catch (error) {
      console.error('Erro ao parsear Mi Scale 2:', error);
      return null;
    }
  };

  const connectToScale = useCallback(async () => {
    if (!navigator.bluetooth) {
      toast({
        title: "Bluetooth não suportado",
        description: "Seu navegador não suporta Web Bluetooth API.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      console.log('🔍 Procurando Mi Body Composition Scale 2...');
      
      const connectDevice = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'MIBFS' },
          { namePrefix: 'MIBCS' },
          { namePrefix: 'MI_SCALE' },
          { namePrefix: 'MiScale' },
          { namePrefix: 'Xiaomi' },
          { name: 'Mi Smart Scale2' },
          { name: 'Mi Body Composition Scale 2' },
        ],
        optionalServices: [
          '0000181d-0000-1000-8000-00805f9b34fb',
          '0000181b-0000-1000-8000-00805f9b34fb',
          '0000fee0-0000-1000-8000-00805f9b34fb',
          '0000fee1-0000-1000-8000-00805f9b34fb',
        ]
      });

      if (connectDevice) {
        console.log('✅ Dispositivo encontrado:', connectDevice.name);
        setDevice(connectDevice);
        
        const server = await connectDevice.gatt?.connect();
        if (!server) {
          throw new Error('Falha ao conectar ao servidor GATT');
        }
        
        console.log('🔗 Conectado ao servidor GATT');
        
        const serviceUUIDs = [
          '0000181d-0000-1000-8000-00805f9b34fb',
          '0000181b-0000-1000-8000-00805f9b34fb',
          '0000fee0-0000-1000-8000-00805f9b34fb',
          '0000fee1-0000-1000-8000-00805f9b34fb'
        ];
        
        let weightService = null;
        for (const serviceUUID of serviceUUIDs) {
          try {
            weightService = await server.getPrimaryService(serviceUUID);
            console.log(`✅ Serviço encontrado: ${serviceUUID}`);
            break;
          } catch (e) {
            console.log(`❌ Serviço ${serviceUUID} não encontrado`);
          }
        }
        
        if (!weightService) {
          throw new Error('Nenhum serviço de balança encontrado');
        }
        
        const characteristicUUIDs = [
          '00002a9d-0000-1000-8000-00805f9b34fb',
          '00002a9c-0000-1000-8000-00805f9b34fb',
          '0000fee2-0000-1000-8000-00805f9b34fb',
          '00002a2f-0000-1000-8000-00805f9b34fb',
        ];
        
        let weightCharacteristic = null;
        for (const charUUID of characteristicUUIDs) {
          try {
            weightCharacteristic = await weightService.getCharacteristic(charUUID);
            console.log(`✅ Característica encontrada: ${charUUID}`);
            break;
          } catch (e) {
            console.log(`❌ Característica ${charUUID} não encontrada`);
          }
        }
        
        if (!weightCharacteristic) {
          throw new Error('Característica de medição não encontrada');
        }
        
        await weightCharacteristic.startNotifications();
        console.log('🔔 Notificações iniciadas - aguardando medições...');
        
        setIsConnected(true);
        setIsConnecting(false);
        
        // Mostrar toast de conexão bem-sucedida
        toast({
          title: "✅ Balança pareada!",
          description: `${connectDevice.name} foi pareada com sucesso. Use o botão "Capturar Peso" para fazer uma medição.`,
        });
        
        weightCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          try {
            const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
            const value = characteristic.value;
            
            if (!value) return;
            
            console.log('📊 Dados recebidos via notificação - byteLength:', value.byteLength);
            console.log('Raw bytes:', Array.from(new Uint8Array(value.buffer)).map(b => b.toString(16).padStart(2, '0')).join(' '));
            
            // Verifica se é uma medição estabilizada antes de processar
            const data = new Uint8Array(value.buffer);
            const ctrlByte0 = data[0];
            const isStabilized = (ctrlByte0 & 0x80) !== 0; // Flag de estabilização
            const hasWeight = (ctrlByte0 & 0x20) !== 0;
            
            console.log('Flags - hasWeight:', hasWeight, 'isStabilized:', isStabilized);
            
            // Só processar se estiver estabilizado ou se estiver calibrando
            if (!hasWeight || (!isStabilized && !isCalibrating)) {
              console.log('⏳ Aguardando estabilização da medição...');
              return;
            }
            
            const scaleData = parseMiScale2Data(value);
            
            if (scaleData && scaleData.weight > 0) {
              console.log('✅ Medição estabilizada - peso:', scaleData.weight);
              
              // Só aceitar dados estabilizados ou durante calibração com peso válido
              if (isStabilized || (isCalibrating && scaleData.weight > 10 && scaleData.weight < 300)) {
                // Atualizar peso em tempo real
                setCurrentWeight(scaleData.weight);
                setLastScaleData(scaleData);
                
                // Se estabilizado, mostrar confirmação
                if (isStabilized) {
                  setIsShowingConfirmation(true);
                  setIsCalibrating(false);
                  
                  toast({
                    title: "⚖️ Medição estabilizada!",
                    description: `${scaleData.weight.toFixed(1)}kg - Confirme se deseja salvar`,
                    duration: 5000,
                  });
                }
              }
            }
          } catch (error) {
            console.error('Erro ao processar dados da balança:', error);
          }
        });
        
        return;
      }

    } catch (error) {
      console.error('Erro ao conectar à balança:', error);
      let errorMessage = "Não foi possível conectar à balança.";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Permissão negada. Habilite o Bluetooth e tente novamente.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Web Bluetooth não suportado. Use Chrome atualizado.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "Balança não encontrada. Certifique-se de que sua Mi Body Composition Scale 2 está ligada e próxima.";
      }
      
      toast({
        title: "Erro de conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const captureWeight = useCallback(async () => {
    if (!isConnected || !device) {
      toast({
        title: "Balança não conectada",
        description: "Conecte-se à balança primeiro",
        variant: "destructive",
      });
      return;
    }

    // Iniciar contagem regressiva de 5 segundos
    setIsWaitingToStep(true);
    setCountdown(5);
    
    toast({
      title: "⏱️ Prepare-se!",
      description: "Aguarde 5 segundos antes de subir na balança.",
    });
    
    const stepCountdown = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(stepCountdown);
          setIsWaitingToStep(false);
          
          // Iniciar período de calibração de 10 segundos
          setIsCalibrating(true);
          setCountdown(10);
          
          toast({
            title: "⚖️ Suba na balança agora!",
            description: "Período de calibração iniciado. Mantenha-se parado.",
          });
          
          const calibrationCountdown = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(calibrationCountdown);
                setIsCalibrating(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isConnected, device, toast]);

  const confirmAndSaveData = useCallback(async () => {
    if (!lastScaleData) return;
    
    setIsShowingConfirmation(false);
    await saveScaleData(lastScaleData);
    
    // Desconectar após salvar
    setTimeout(() => {
      device?.gatt?.disconnect();
      setIsConnected(false);
      setCurrentWeight(null);
      setLastScaleData(null);
    }, 2000);
  }, [lastScaleData, device]);

  const rejectData = useCallback(() => {
    setIsShowingConfirmation(false);
    setCurrentWeight(null);
    setLastScaleData(null);
    
    toast({
      title: "Medição rejeitada",
      description: "Suba na balança novamente para nova medição.",
    });
  }, [toast]);

  const saveScaleData = useCallback(async (scaleData: ScaleData) => {
    try {
      // Obter perfil do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      // Assumir altura padrão de 170cm para cálculo do IMC (idealmente deveria vir do perfil)
      const height = 170; // Pode ser obtido do perfil do usuário
      const bmi = calculateBMI(scaleData.weight, height);

      const pesagemData: ParsedScaleData = {
        peso_kg: scaleData.weight,
        imc: bmi,
        gordura_corporal_pct: scaleData.bodyFat,
        agua_corporal_pct: scaleData.water,
        massa_muscular_kg: scaleData.muscle,
        massa_ossea_kg: scaleData.boneMass,
        taxa_metabolica_basal: scaleData.bmr,
        idade_metabolica: scaleData.metabolicAge,
        gordura_visceral: scaleData.visceralFat,
        tipo_corpo: scaleData.bodyType,
        origem_medicao: 'balança',
      };

      const { error } = await supabase
        .from('pesagens')
        .insert({
          user_id: profile.id,
          ...pesagemData,
        });

      if (error) throw error;

      toast({
        title: "Medição salva!",
        description: `Peso: ${scaleData.weight.toFixed(1)}kg registrado com sucesso.`,
      });

      // Recarregar a página para mostrar os novos dados
      window.location.reload();

    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados da medição.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setIsConnected(false);
    setIsWaitingToStep(false);
    setIsCalibrating(false);
    setCountdown(0);
    setCurrentWeight(null);
    setLastScaleData(null);
    setIsShowingConfirmation(false);
    
    toast({
      title: "Desconectado",
      description: "Conexão com a balança foi encerrada.",
    });
  }, [device, toast]);

  return {
    connectToScale,
    captureWeight,
    disconnect,
    isConnecting,
    isConnected,
    device,
    isWaitingToStep,
    isCalibrating,
    countdown,
    currentWeight,
    lastScaleData,
    isShowingConfirmation,
    confirmAndSaveData,
    rejectData,
  };
};
