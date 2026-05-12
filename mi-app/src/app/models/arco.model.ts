export interface Arco {
  id: number;
  etiqueta: string;
  procesoId: number;
  actividadOrigenId?: number;
  actividadDestinoId?: number;
  gatewayOrigenId?: number;
  gatewayDestinoId?: number;
}
