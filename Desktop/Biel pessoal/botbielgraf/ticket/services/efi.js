const axios = require("axios");

const clientId = process.env.EFI_CLIENT_ID;
const clientSecret = process.env.EFI_CLIENT_SECRET;
const sandbox = process.env.EFI_SANDBOX === "true";

const baseURL = sandbox
  ? "https://pix-h.api.efipay.com.br"
  : "https://pix.api.efipay.com.br";

let cachedToken = null;
let tokenExpiry = null;

/**
 * Obter token OAuth2 da Efí
 */
async function obterToken() {
  // Se token em cache ainda é válido, usar ele
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.post(
      `${baseURL}/oauth/token`,
      { grant_type: "client_credentials" },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      }
    );

    cachedToken = response.data.access_token;
    // Token expira em 3600 segundos, usar 3500 para segurança
    tokenExpiry = Date.now() + (3500 * 1000);

    console.log("✅ Token Efí gerado com sucesso");
    return cachedToken;
  } catch (error) {
    console.error("❌ Erro ao obter token Efí:", error.response?.data || error.message);
    throw new Error("Falha ao autenticar com Efí");
  }
}

/**
 * Gerar cobrança PIX via Efí
 */
async function gerarPix(valor, descricao) {
  try {
    if (!clientId || !clientSecret || !process.env.EFI_PIX_KEY) {
      throw new Error("Credenciais da Efí não configuradas");
    }

    const token = await obterToken();

    // 💳 Criar cobrança
    const response = await axios.post(
      `${baseURL}/v2/cob`,
      {
        calendario: { expiracao: 3600 }, // Expira em 1 hora
        valor: { original: valor.toFixed(2) },
        chave: process.env.EFI_PIX_KEY,
        solicitacaoPagador: descricao
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Cobrança PIX criada:", response.data.id);
    return response.data;

  } catch (error) {
    console.error("❌ Erro ao criar cobrança Efí:", error.response?.data || error.message);
    return null;
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
        }
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
