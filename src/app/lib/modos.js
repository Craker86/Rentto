// Modos de operación de Rentto (MODELO-NEGOCIO.md)
// Cada propiedad tiene un `modo` que define garantías, comisiones y scoring mínimo.

export const MODOS = {
  basico: {
    id: "basico",
    label: "Básico",
    slogan: "Facilitador",
    descripcion: "Plataforma de pago digital sin garantía de impago.",
    scoreMinimo: 50,
    propietario: {
      primerMes: 0,   // %
      mensual: 5,     // %
    },
    inquilino: {
      primerMes: 0,
      mensual: 0,
    },
    coberturaMeses: 0,
    features: [
      "Plataforma de pago digital",
      "Contrato electrónico simple",
      "Verificación básica de identidad",
    ],
  },
  protegido: {
    id: "protegido",
    label: "Protegido",
    slogan: "Garante parcial",
    descripcion: "Rentto cubre hasta 1 mes de impago con scoring reforzado.",
    scoreMinimo: 70,
    propietario: {
      primerMes: 15,
      mensual: 4,
    },
    inquilino: {
      primerMes: 0,
      mensual: 3,
    },
    coberturaMeses: 1,
    features: [
      "Todo lo de Básico",
      "Garantía de 1 mes de renta ante impago",
      "Scoring completo con referencias",
      "Contrato con trazabilidad reforzada",
    ],
  },
  premium: {
    id: "premium",
    label: "Premium",
    slogan: "Garante total",
    descripcion: "Rentto cubre hasta 3 meses de impago con validación bancaria.",
    scoreMinimo: 85,
    propietario: {
      primerMes: 20,
      mensual: 5,
    },
    inquilino: {
      primerMes: 0,
      mensual: 5,
    },
    coberturaMeses: 3,
    features: [
      "Todo lo de Protegido",
      "Garantía de hasta 3 meses de renta",
      "Verificación de ingresos bancaria",
      "Firma electrónica certificada SUSCERTE",
    ],
  },
};

export const MODOS_LISTA = [MODOS.basico, MODOS.protegido, MODOS.premium];

export function getModo(id) {
  return MODOS[id] || MODOS.basico;
}

export function toneDeModo(id) {
  switch (id) {
    case "premium": return "brand";
    case "protegido": return "success";
    case "basico": return "warning";
    default: return "neutral";
  }
}

/** Calcula las comisiones en USD según monto mensual de renta. */
export function calcularComisiones(modoId, montoMensual) {
  const modo = getModo(modoId);
  const renta = Number(montoMensual) || 0;
  const primerMesProp = (modo.propietario.primerMes / 100) * renta;
  const mensualProp = (modo.propietario.mensual / 100) * renta;
  const mensualInq = (modo.inquilino.mensual / 100) * renta;
  return {
    primerMesProp,
    mensualProp,
    mensualInq,
    totalPrimerMesInq: renta + mensualInq,   // lo que paga el inquilino el primer mes
    totalMensualInq: renta + mensualInq,
    netoMensualProp: renta - mensualProp,    // lo que recibe el propietario cada mes
  };
}
