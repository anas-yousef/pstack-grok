# Payment providers in sandbox

The **Auth, payments, and security** playbook links here. The providers are listed alphabetically, and none is a default. Pick the one that sells where you sell. Stripe is the common choice where it is available. Where it is not, or where you want the provider to handle sales tax and VAT, a merchant-of-record provider such as Lemon Squeezy or Paddle is an option. Check each provider's docs for the countries and terms it covers.

Each row below comes from the provider's official docs, read on 2026-10-22, and links to its source. Docs change, so open the page before you rely on a detail. "Not documented" means the pages read did not say. Treat that path as a gap until the provider's docs or a sandbox run settles it.

## Lemon Squeezy

- **Test mode.** A new store starts in test mode. API keys created in test mode reach test-mode data only. The page lists test cards for success, insufficient funds, an expired card, and 3D Secure. [Test mode](https://docs.lemonsqueezy.com/help/getting-started/test-mode)
- **Signature.** `X-Signature` holds an HMAC-SHA256 hex digest of the raw request body, keyed with the webhook's signing secret. [Signing requests](https://docs.lemonsqueezy.com/help/webhooks/signing-requests)
- **Delivery.** Return `200`. Any other status is retried up to three more times with exponential backoff, for example after 5, 25, and 125 seconds. The documented headers are `Content-Type`, `X-Event-Name`, and `X-Signature`. [Webhook requests](https://docs.lemonsqueezy.com/help/webhooks/webhook-requests)
- **Event ids.** No per-event or per-delivery id is documented. The body has `meta.event_name` and `data.id`, and `data.id` is the order or subscription, not the event.
- **Events.** The event types include `order_created`, `order_refunded`, `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`, `subscription_payment_success`, `subscription_payment_failed`, `subscription_payment_recovered`, and `subscription_payment_refunded`. No dispute or chargeback event is listed. [Event types](https://docs.lemonsqueezy.com/help/webhooks/event-types)
- **Simulation.** Webhook events can be simulated for test-mode orders and subscriptions, and test and live webhooks are kept separate. The simulate page also lists a plan-change option, which is not a name on the event types page. Check which event it actually sends. [Simulate webhook events](https://docs.lemonsqueezy.com/help/webhooks/simulate-webhook-events)
- **Not documented.** Whether simulated events are signed, and how to simulate a dispute or chargeback. [Refunds and chargebacks](https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks)

## Paddle

- **Sandbox.** A separate account, dashboard, and dataset. The API base is `https://sandbox-api.paddle.com`, and live is `https://api.paddle.com`. Credentials do not work across the two. A sandbox API key contains `_sdbx`, and a client-side token starts with `test_`. Sandbox rejects real cards and lists test cards for success, 3DS, a decline, and a success followed by a later decline. The page says sandbox "auto-approves refund adjustments every 10 minutes". [Sandbox](https://developer.paddle.com/build/tools/sandbox)
- **Signature.** `Paddle-Signature` is `ts=<unix time>;h1=<hex>`. It is an HMAC-SHA256 of `<ts>:<raw body>`, keyed with the notification destination's secret. The default tolerance between `ts` and the current time is five seconds, and Paddle's SDKs use the same. [Signature verification](https://developer.paddle.com/webhooks/signature-verification)
- **Delivery.** Return `200` within five seconds. Sandbox makes 3 attempts within about two minutes. Live makes up to 60 attempts over about two days. Delivery order is not guaranteed, so compare each event's `occurred_at` before applying it, and use `event_id` to skip events you already processed. [Respond to webhooks](https://developer.paddle.com/webhooks/about/respond-to-webhooks)
- **Simulator.** Works in sandbox and production without creating real transactions. Simulated events carry a `Paddle-Signature` and can be verified like real ones. Scenarios cover subscription creation, renewal (including a failed payment and dunning), pause, resume, and cancellation. A failed simulated event can be replayed by hand. The pages read do not describe automatic retries for simulated events, so test retry handling with real sandbox deliveries. [Simulator](https://developer.paddle.com/webhooks/simulator), [Test webhooks](https://developer.paddle.com/webhooks/simulator/test-webhooks)
- **Not documented.** Chargeback simulation.

## PayPal

- **Sandbox.** A separate test environment with sandbox accounts, sandbox credentials, and sandbox endpoints. Going live means switching the credentials and the endpoints. [Sandbox](https://developer.paypal.com/tools/sandbox/)
- **Signature.** An asymmetric signature, verified against PayPal's certificate, not an HMAC compare. Post the delivery to `POST /v1/notifications/verify-webhook-signature`. All seven fields are required:
  - `auth_algo` from the `PAYPAL-AUTH-ALGO` header
  - `cert_url` from `PAYPAL-CERT-URL`
  - `transmission_id` from `PAYPAL-TRANSMISSION-ID`
  - `transmission_sig` from `PAYPAL-TRANSMISSION-SIG`
  - `transmission_time` from `PAYPAL-TRANSMISSION-TIME`
  - `webhook_id`, the id of your webhook as configured in your developer account
  - `webhook_event`, the event body exactly as received

  [Verify webhook signature](https://developer.paypal.com/api/webhooks/v1/verify-webhook-signature-post). The integration guide also documents self-verification. You build `transmissionId|timeStamp|webhookId|crc32` from the raw body and check the transmission signature with the public key from `PAYPAL-CERT-URL`. [Integration guide](https://developer.paypal.com/api/rest/webhooks/rest/)
- **Delivery.** Return a 2xx. Any other status is retried up to 25 times over 3 days. The event id is the top-level `id`. [Webhooks](https://developer.paypal.com/api/rest/webhooks/)
- **Simulator.** The webhook simulator sends mock events. Mock events cannot be verified through the verify-webhook-signature endpoint, so prove verification with real sandbox events. [Integration guide](https://developer.paypal.com/api/rest/webhooks/rest/)
- **Disputes.** The Disputes API marks two methods as sandbox-only, settling a dispute and requiring evidence. That lets you drive a dispute's outcome in sandbox. How to open a dispute in sandbox is not documented on that page. [Disputes API](https://developer.paypal.com/docs/api/customer-disputes/v1/)

## Stripe

- **Sandbox.** A sandbox is an isolated test environment, reached from the account picker. Use test API keys with test cards. Live payments do not run on test keys. The testing page lists decline cards (generic, insufficient funds, lost, stolen, expired, incorrect CVC, processing error), dispute cards that open a fraudulent dispute, and cards that make a refund fail or stay pending. [Testing](https://docs.stripe.com/testing)
- **Signature.** `Stripe-Signature` is `t=<timestamp>,v1=<hex>`. `v1` is an HMAC-SHA256 of `<t>.<raw body>`, keyed with the endpoint's `whsec_` secret. Ignore schemes other than `v1`. The official libraries default to a five-minute tolerance. Do not set it to `0`. Test and live endpoints have different secrets. [Webhooks](https://docs.stripe.com/webhooks)
- **Delivery.** Return a 2xx quickly. Live retries for up to three days. Sandbox retries three times over a few hours. Order is not guaranteed. Track event ids to skip duplicates, and do not use `created` to order events. [Webhooks](https://docs.stripe.com/webhooks)
- **Local testing.** `stripe listen --forward-to <url>` forwards events and prints a signing secret. `stripe trigger <event>` creates a test event. [Webhooks](https://docs.stripe.com/webhooks)
