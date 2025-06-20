import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key
const stripePromise = loadStripe('pk_test_51IdAPSSCR1Fp0snPJ7OPfcjLg919C3WZuk6Wjpj4boivAmUsZ5QjPCuLKDE0A1gHSsZ2fea5AS3PjZqrI1AmiqCU00joWpZI6C');

export default stripePromise;