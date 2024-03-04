import Stripe from 'stripe';

const CURRENCY = 'EUR';

const params: Stripe.Checkout.SessionCreateParams = {
  submit_type: 'donate',
  payment_method_type: ['card'],
  line_items: [
    {
      name: 'Custom amount donation',
      amount: formatAmountForStripe(30.5, 'EUR'),
      currency: 'EUR',
      quantity: 1,
    },
  ],
  success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
};

const checkoutSession: Stripe.Checkout.Session =
  await stripe.checkout.sessions.create(params);
