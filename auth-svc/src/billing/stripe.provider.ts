
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

export const StripeProvider = {
  provide: STRIPE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Stripe => {
    const secret = config.getOrThrow<string>(
      'STRIPE_SECRET_KEY',
    );

    return new Stripe(secret);
  },
};
