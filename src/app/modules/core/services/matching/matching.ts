import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
const MatchingPlugin = registerPlugin('MatchingPlugin') as any;

@Injectable({
  providedIn: 'root',
})
export class MatchingService {
  private listenerHandle: any = null;

  constructor() {}

  // Abre la vista nativa; devuelve la respuesta del plugin (Promise)
  async openMatching(userId?: string): Promise<any> {
    // Si no estamos en un dispositivo nativo, puedes manejar un fallback
    if (!Capacitor.isNativePlatform()) {
      console.warn(
        'openMatching: no estás en plataforma nativa, simulando respuesta'
      );
      return { matchedUserId: null };
    }

    try {
      const res = await (MatchingPlugin as any).openMatching({ userId });
      return res;
    } catch (err) {
      // Maneja rechazo o errores
      throw err;
    }
  }

  // Añadir un listener para el evento 'matchingClosed'
  async addMatchingClosedListener(callback: (data: any) => void) {
    if (!Capacitor.isNativePlatform()) {
      console.warn(
        'addMatchingClosedListener: no nativo, no se registra listener'
      );
      return null;
    }
    // Si ya existe, removemos para evitar duplicados
    if (this.listenerHandle && this.listenerHandle.remove) {
      this.listenerHandle.remove();
      this.listenerHandle = null;
    }
    this.listenerHandle = await (MatchingPlugin as any).addListener(
      'matchingClosed',
      (info: any) => {
        callback(info);
      }
    );
    return this.listenerHandle;
  }

  // Remover listener si existe
  removeMatchingClosedListener() {
    if (this.listenerHandle && this.listenerHandle.remove) {
      this.listenerHandle.remove();
      this.listenerHandle = null;
    }
  }
}
