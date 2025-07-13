
import { Bluetooth, BluetoothOff, Scale, Timer, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBluetoothScale } from '@/hooks/useBluetoothScale';
import { Badge } from '@/components/ui/badge';

export const BluetoothScaleConnection = () => {
  const { 
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
    rejectData
  } = useBluetoothScale();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Conexão com Balanças Inteligentes
        </CardTitle>
        <CardDescription>
          Conecte sua balança Xiaomi (Mi Scale v1/v2, Mi Body Composition Scale) para captura automática de dados via Bluetooth
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da conexão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Bluetooth className="h-4 w-4 text-green-500" />
                <span className="text-sm">Balança conectada</span>
              </>
            ) : (
              <>
                <BluetoothOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Desconectado</span>
              </>
            )}
          </div>
          
          {isConnected && (
            <Badge variant="outline" className="text-green-700 border-green-200">
              Conectado
            </Badge>
          )}
        </div>

        {/* Estados de medição */}
        {isWaitingToStep && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  ⏱️ Prepare-se para subir na balança
                </p>
                <p className="text-lg font-bold text-yellow-700">
                  {countdown} segundos restantes
                </p>
                <p className="text-xs text-yellow-600">
                  Aguarde a contagem antes de subir na balança
                </p>
              </div>
            </div>
          </div>
        )}

        {isCalibrating && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Weight className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  ⚖️ Calibrando - Mantenha-se parado!
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {countdown} segundos restantes
                </p>
                <p className="text-xs text-blue-600">
                  Não se mova durante a calibração para obter medições precisas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instruções detalhadas */}
        {!isConnected && !isWaitingToStep && !isCalibrating && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📋 Como usar:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>🔧 Habilite flags experimentais no Chrome: <code className="bg-background px-1 rounded">chrome://flags/#enable-experimental-web-platform-features</code></li>
              <li>🔋 Ligue sua balança Xiaomi (Mi Scale v1, v2 ou Mi Body Composition Scale)</li>
              <li>📶 Certifique-se que o Bluetooth está habilitado no seu dispositivo</li>
              <li>🔍 Clique no botão "Conectar Balança" para parear</li>
              <li>⚖️ <strong>Use o botão "Capturar Peso"</strong> para iniciar uma medição</li>
              <li>⏱️ <strong>Aguarde 5 segundos</strong> para se preparar</li>
              <li>✅ <strong>Suba na balança</strong> quando solicitado e mantenha-se parado</li>
            </ol>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <strong>💡 Dica:</strong> O pareamento é feito apenas uma vez. Use "Capturar Peso" quantas vezes quiser.
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={connectToScale}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <Bluetooth className="h-4 w-4" />
              {isConnecting ? 'Conectando...' : 'Conectar Balança'}
            </Button>
          ) : (
            <>
              <Button 
                onClick={captureWeight}
                disabled={isWaitingToStep || isCalibrating}
                className="flex items-center gap-2"
              >
                <Weight className="h-4 w-4" />
                {isWaitingToStep || isCalibrating ? 'Medição em andamento...' : 'Capturar Peso'}
              </Button>
              <Button 
                onClick={disconnect}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isWaitingToStep || isCalibrating}
              >
                <BluetoothOff className="h-4 w-4" />
                Desconectar
              </Button>
            </>
          )}
        </div>

        {/* Compatibilidade */}
        {!(navigator as any).bluetooth?.requestLEScan && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Seu navegador não suporta Web Bluetooth Scanning API. 
              Para usar esta funcionalidade:<br/>
              1. Use Chrome 79+ ou Edge baseado em Chromium<br/>
              2. Acesse chrome://flags/#enable-experimental-web-platform-features<br/>
              3. Habilite a flag "Experimental Web Platform features"<br/>
              4. Reinicie o navegador
            </p>
          </div>
        )}

        {/* Peso em tempo real */}
        {currentWeight && !isShowingConfirmation && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-800 mb-2">
                {currentWeight.toFixed(1)}
                <span className="text-2xl ml-2">kg</span>
              </div>
              <p className="text-sm text-blue-600">
                Peso detectado em tempo real
              </p>
            </div>
          </div>
        )}

        {/* Confirmação de dados */}
        {isShowingConfirmation && currentWeight && lastScaleData && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-yellow-800 mb-2">
                {currentWeight.toFixed(1)}
                <span className="text-xl ml-2">kg</span>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                Confirme se os dados estão corretos:
              </p>
              
              {lastScaleData.bodyFat && (
                <div className="grid grid-cols-3 gap-2 text-xs text-yellow-700 mb-4">
                  <div>Gordura: {lastScaleData.bodyFat}%</div>
                  <div>Água: {lastScaleData.water}%</div>
                  <div>Músculo: {lastScaleData.muscle?.toFixed(1)}kg</div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={confirmAndSaveData}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                ✅ Salvar Dados
              </Button>
              <Button 
                onClick={rejectData}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                ❌ Medir Novamente
              </Button>
            </div>
          </div>
        )}

        {/* Status de medição quando conectado */}
        {isConnected && !isWaitingToStep && !isCalibrating && !currentWeight && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">
                  ✅ <strong>Balança pareada e pronta!</strong>
                </p>
                <p className="text-xs text-green-700">
                  Clique em "Capturar Peso" para iniciar uma nova medição.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
