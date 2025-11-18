
import { SignUpCredentials } from "./authTypes";
import authService from "@/services/authService";

/**
 * Serviço para operações de registro
 */
const registrationService = {
  /**
   * Cadastra um novo usuário
   */
  async signUp(credentials: SignUpCredentials) {
    console.log('RegistrationService: Cadastrando usuário via backend com:', credentials.email);
    const response = await authService.signUp(
      credentials.email,
      credentials.password,
      credentials.nome,
      credentials.telefone,
      credentials.cnpj,
      credentials.tipo_usuario ?? 'transportador',
      credentials.razao_social,
      credentials.operador_logistico_cnpj
    );

    return response;
  },
};

export default registrationService;
