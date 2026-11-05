/**
 * Oferta exibida na página de vendas (/conheca).
 * ⚠️ Valores de EXEMPLO — troque antes de divulgar.
 */
export const OFFER = {
  /** Nome do plano no card de preço. */
  planName: "Acesso completo",
  /** Preço "de" (riscado). Deixe "" para não exibir. */
  priceFrom: "R$ 297",
  /** Preço à vista. */
  price: "R$ 197",
  /** Linha de parcelamento. Deixe "" para não exibir. */
  installments: "ou 12x de R$ 19,70",
  /** Período de acesso. */
  accessPeriod: "Acesso por 12 meses",
  /**
   * Link do checkout (Hotmart, Kiwify, Stripe…). Enquanto vazio,
   * os botões levam ao cadastro do próprio app.
   */
  checkoutUrl: "",
};

export const SIGNUP_URL = "/login?modo=criar";
export const CTA_URL = OFFER.checkoutUrl || SIGNUP_URL;
