import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  stripeClient = new Stripe(secretKey, {
    typescript: true,
  });

  return stripeClient;
}

// Plan configurations
export const PLANS = {
  trial: {
    name: 'Trial',
    nameEs: 'Prueba Gratuita',
    maxMembers: 25,
    price: 0,
    priceId: null,
    features: ['25 personas', '14 días de prueba', 'Todas las funcionalidades'],
    featuresEs: ['25 personas', '14 días de prueba', 'Todas las funcionalidades'],
  },
  pastor: {
    name: 'Pastor',
    nameEs: 'Pastor',
    maxMembers: 100,
    price: 12,
    priceId: process.env.STRIPE_PRICE_PASTOR,
    features: ['Up to 100 people', '1 user', 'Email support', 'Data export'],
    featuresEs: ['Hasta 100 personas', '1 usuario', 'Soporte por email', 'Exportar datos'],
  },
  team: {
    name: 'Team',
    nameEs: 'Equipo',
    maxMembers: 300,
    price: 25,
    priceId: process.env.STRIPE_PRICE_TEAM,
    features: ['Up to 300 people', '3 users', 'Priority support', 'Data export'],
    featuresEs: ['Hasta 300 personas', '3 usuarios', 'Soporte prioritario', 'Exportar datos'],
  },
  church: {
    name: 'Church',
    nameEs: 'Iglesia',
    maxMembers: 999999,
    price: 49,
    priceId: process.env.STRIPE_PRICE_CHURCH,
    features: ['Unlimited people', '10 users', 'Priority support', 'Custom branding'],
    featuresEs: ['Personas ilimitadas', '10 usuarios', 'Soporte prioritario', 'Marca personalizada'],
  },
} as const;

export type PlanType = keyof typeof PLANS;
// Production LIVE keys v2
