
import * as solicitacaoService from './solicitacaoService';
import * as coletaRegistroService from './coletaRegistroService';
import * as metricsService from './metricsService';

export default {
  ...solicitacaoService,
  ...coletaRegistroService,
  ...metricsService
};
