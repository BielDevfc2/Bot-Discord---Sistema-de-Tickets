const axios = require("axios");

const clientId = process.env.EFI_CLIENT_ID;
const clientSecret = process.env.EFI_CLIENT_SECRET;
const sandbox = process.env.EFI_SANDBOX === "true";

const baseURL = sandbox
  ? "https://pix-h.api.efipay.com.br"
  : "https://pix.api.efipay.com.br";

let cachedToken = null;
let tokenExpiry = null;

console.log(`🔐 Efí configurado: SANDBOX=${sandbox}, URL=${baseURL}`);

/**
 * Obter token OAuth2 da Efí com retry
 */
async function obterToken(tentativa = 1) {
  // Se token em cache ainda é válido, usar ele
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    if (!clientId || !clientSecret) {
      throw new Error(`Credenciais incompletas: CLIENT_ID=${!!clientId}, SECRET=${!!clientSecret}`);
    }

    console.log(`🔐 Obtendo token Efí (tentativa ${tentativa})...`);

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.post(
      `${baseURL}/oauth/token`,
      { grant_type: "client_credentials" },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (3500 * 1000);

    console.log("✅ Token Efí gerado com sucesso");
    return cachedToken;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error_description || error.message;
    console.error(`❌ Erro ao obter token Efí (${error.code}):`, errorMsg);
    console.error(`Status: ${error.response?.status || 'N/A'}, URL: ${baseURL}/oauth/token`);
    console.error(`Client ID começa com: ${clientId?.substring(0, 20)}...`);
    
    // Retry uma vez
    if (tentativa < 2) {
      console.log("🔄 Tentando novamente...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // esperar 1s antes de retry
      return await obterToken(tentativa + 1);
    }
    
    throw new Error(`Falha na autenticação Efí: ${errorMsg}`);
  }
}

/**
 * Gerar cobrança PIX via Efí
 */
async function gerarPix(valor, descricao) {
  try {
    if (!clientId || !clientSecret || !process.env.EFI_PIX_KEY) {
      throw new Error(
        `Credenciais incompletas:\n` +
        `EFI_CLIENT_ID: ${!!clientId}\n` +
        `EFI_CLIENT_SECRET: ${!!clientSecret}\n` +
        `EFI_PIX_KEY: ${!!process.env.EFI_PIX_KEY}`
      );
    }

    console.log(`💳 Gerando PIX: R$ ${valor.toFixed(2)} (${descricao})`);

    const token = await obterToken();

    const response = await axios.post(
      `${baseURL}/v2/cob`,
      {
        calendario: { expiracao: 3600 },
        valor: { original: valor.toFixed(2) },
        chave: process.env.EFI_PIX_KEY,
        solicitacaoPagador: descricao
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log("✅ Cobrança PIX criada:", response.data.id);
    return response.data;

  } catch (error) {
    const errorMsg = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message ||
                     "Erro desconhecido";
    
    console.error("❌ Erro ao criar cobrança Efí:", errorMsg);
    return { error: errorMsg };
  }
}

/**
 * Verificar status de uma cobrança
 */
async function verificarCobranca(pixId) {
  try {
    const token = await obterToken();

    const response = await axios.get(
      `${baseURL}/v2/cob/${pixId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Erro ao verificar cobrança:", error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  gerarPix,
  verificarCobranca,
  obterToken
};
