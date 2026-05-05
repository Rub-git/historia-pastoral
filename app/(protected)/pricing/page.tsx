'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Users, Church, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  nameEs: string;
  price: number;
  maxMembers: number;
  features: string[];
  featuresEs: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'pastor',
    name: 'Pastor',
    nameEs: 'Pastor',
    price: 12,
    maxMembers: 100,
    features: ['Up to 100 people', '1 user account', 'Email support', 'Data export'],
    featuresEs: ['Hasta 100 personas', '1 cuenta de usuario', 'Soporte por email', 'Exportar datos'],
    icon: <Crown className="w-8 h-8" />,
  },
  {
    id: 'team',
    name: 'Team',
    nameEs: 'Equipo',
    price: 25,
    maxMembers: 300,
    features: ['Up to 300 people', '3 user accounts', 'Priority support', 'Data export'],
    featuresEs: ['Hasta 300 personas', '3 cuentas de usuario', 'Soporte prioritario', 'Exportar datos'],
    icon: <Users className="w-8 h-8" />,
    popular: true,
  },
  {
    id: 'church',
    name: 'Church',
    nameEs: 'Iglesia',
    price: 49,
    maxMembers: 999999,
    features: ['Unlimited people', '10 user accounts', 'Priority support', 'Custom branding'],
    featuresEs: ['Personas ilimitadas', '10 cuentas de usuario', 'Soporte prioritario', 'Marca personalizada'],
    icon: <Church className="w-8 h-8" />,
  },
];

export default function PricingPage() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('trial');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('trialing');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setCurrentPlan(data.subscriptionPlan || 'trial');
        setSubscriptionStatus(data.subscriptionStatus || 'trialing');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      console.log('Stripe checkout response:', data);

      if (data?.url) {
        // Use window.open as fallback if location.assign doesn't work
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup was blocked, try direct navigation
          window.location.href = data.url;
        }
      } else {
        const errorMsg = data?.error || (language === 'es' ? 'Error al iniciar el pago' : 'Error starting checkout');
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(language === 'es' ? 'Error al procesar la solicitud' : 'Error processing request');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('manage');

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(null);
    }
  };

  const content = {
    es: {
      title: 'Planes y Precios',
      subtitle: 'Elige el plan que mejor se adapte a tu ministerio',
      month: '/mes',
      currentPlan: 'Plan Actual',
      subscribe: 'Suscribirse',
      upgrade: 'Mejorar Plan',
      manageSubscription: 'Administrar Suscripción',
      popular: 'Más Popular',
      trialInfo: 'Actualmente en período de prueba gratuita',
      trialEnds: 'Tu prueba termina pronto. Elige un plan para continuar.',
      annualDiscount: 'Ahorra 2 meses con el plan anual',
    },
    en: {
      title: 'Plans & Pricing',
      subtitle: 'Choose the plan that best fits your ministry',
      month: '/month',
      currentPlan: 'Current Plan',
      subscribe: 'Subscribe',
      upgrade: 'Upgrade',
      manageSubscription: 'Manage Subscription',
      popular: 'Most Popular',
      trialInfo: 'Currently on free trial',
      trialEnds: 'Your trial ends soon. Choose a plan to continue.',
      annualDiscount: 'Save 2 months with annual plan',
    },
  };

  const c = content[language];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-sage-800 font-serif mb-4">
          {c.title}
        </h1>
        <p className="text-sage-600 text-lg">
          {c.subtitle}
        </p>
        {subscriptionStatus === 'trialing' && (
          <p className="text-amber-600 mt-4 bg-amber-50 inline-block px-4 py-2 rounded-lg">
            {c.trialInfo}
          </p>
        )}
      </div>

      {/* Manage Subscription Button for active subscribers */}
      {subscriptionStatus === 'active' && currentPlan !== 'trial' && (
        <div className="text-center mb-8">
          <Button
            onClick={handleManageSubscription}
            variant="outline"
            disabled={loading === 'manage'}
          >
            {loading === 'manage' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {c.manageSubscription}
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const features = language === 'es' ? plan.featuresEs : plan.features;

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-sage-500 border-2 shadow-lg' : 'border-sage-200'
              } ${isCurrentPlan ? 'ring-2 ring-sage-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-sage-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {c.popular}
                  </span>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl font-serif">
                  {language === 'es' ? plan.nameEs : plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-sage-800">
                    ${plan.price}
                  </span>
                  <span className="text-sage-600">{c.month}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <ul className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sage-700">
                      <Check className="w-5 h-5 text-sage-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button disabled className="w-full" variant="outline">
                    {c.currentPlan}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full"
                    disabled={loading === plan.id}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {subscriptionStatus === 'active' ? c.upgrade : c.subscribe}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-sage-500 text-sm mt-8">
        {c.annualDiscount}
      </p>
    </div>
  );
}
