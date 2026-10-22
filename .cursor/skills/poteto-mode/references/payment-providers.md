# Payment providers in sandbox

The **Auth, payments, and security** playbook links here. Each row below comes from the provider's official docs, read on 2026-10-22. Docs change, so open the linked page before you rely on a detail. Where a row says "not documented", the pages read did not say. Check the provider docs, and treat the path as a gap until a doc or a sandbox run shows otherwise.

The owner cannot use Stripe from Israel, so Stripe is not covered.

## Lemon Squeezy

Lemon Squeezy is the merchant of record, so it collects VAT and sales tax.

- **Test mode.** A new store starts in test mode, and a dashboard toggle switches modes. [Test mode](https://docs.lemonsqueezy.com/help/getting-started/test-mode)
- **Keys.** An API key created in test mode reaches test-mode data only. A live key is created in live mode.
- **Test cards.** The test mode page lists cards for success, insufficient funds, an expired card, and 3D Secure.
- **Webhooks.** A test-mode webhook fires only for test-mode data. The signature is in `X-Signature`. It is an HMAC-SHA256 hex digest of the raw body, keyed with the webhook's signing secret. [Signing requests](https://docs.lemonsqueezy.com/help/webhooks/signing-requests)
- **Retries.** A non-2xx response is retried up to three more times with exponential backoff, for example 5, 25, and 125 seconds. A `200` marks it received. [Webhook requests](https://docs.lemonsqueezy.com/help/webhooks/webhook-requests)
- **Simulating events.** For any test-mode order or subscription you can simulate `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`, `subscription_plan_changed`, `order_created`, and `order_refunded`. Logged webhooks can be resent from the webhook settings. [Simulate webhook events](https://docs.lemonsqueezy.com/help/webhooks/simulate-webhook-events)
- **Known gaps.**
  - No per-event or per-delivery id is documented. The body carries `meta.event_name` and the resource's `data.id`, which identifies the order or subscription, not the event.
  - The simulate page does not say whether simulated events are signed. Find out by sending one to your handler with signature checks on.
  - Chargeback and dispute simulation is not documented. [Refunds and chargebacks](https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks)

## PayPal

- **Sandbox.** A separate test environment with the same API feature set as live, apart from a few account features. Create sandbox accounts for each party on the Accounts page. Use sandbox endpoints and sandbox credentials. Going live means switching both. [Sandbox](https://developer.paypal.com/tools/sandbox/)
- **Webhooks.** Subscribe the listener to a sandbox REST app's events. A real sandbox transaction then sends real sandbox events. Verification uses the `paypal-transmission-id`, `paypal-transmission-time`, `paypal-cert-url`, and `paypal-transmission-sig` headers. You can verify yourself, or post the event to PayPal's verify-webhook-signature endpoint. The event id is the top-level `id` field. [Integration guide](https://developer.paypal.com/api/rest/webhooks/rest/)
- **Retries.** A non-2xx response is retried up to 25 times over 3 days. [Webhooks](https://developer.paypal.com/api/rest/webhooks/)
- **Simulator.** The [webhook simulator](https://developer.paypal.com/api/rest/webhooks/simulator/) sends mock events. The verify-webhook-signature endpoint does not accept them, so verify a mock event yourself, or prove verification with real sandbox events.
- **Known gaps.** Negative testing, refunds, and dispute simulation in sandbox were not covered on the pages read. Check the provider docs.

## Paddle

- **Sandbox.** A separate account, dashboard, and dataset at `sandbox-vendors.paddle.com`. The API base is `https://sandbox-api.paddle.com`, and live is `https://api.paddle.com`. Credentials do not work across the two. A sandbox API key contains `_sdbx`, and a client-side token starts with `test_`. Sandbox rejects real card numbers and lists test cards, including a decline and a card that succeeds first and declines later. [Sandbox](https://developer.paddle.com/build/tools/sandbox)
- **Refunds.** Sandbox auto-approves refund adjustments every 10 minutes, so a refund can be tested end to end.
- **Webhooks.** The signature is in `Paddle-Signature` as `ts=<unix time>;h1=<hex>`. It is an HMAC-SHA256 of `<ts>:<raw body>`, keyed with the notification destination's secret. Reject an old `ts`. [Signature verification](https://developer.paddle.com/webhooks/signature-verification)
- **Retries.** Sandbox makes 3 delivery attempts within about two minutes, and expects a `2xx` within 5 seconds.
- **Simulator.** The simulator sends signed events, including `event_id`. It runs scenarios for subscription creation, renewal (including a failed payment and dunning), pause, resume, and cancellation, and single events such as `transaction.payment_failed` and `adjustment.created`. [Test webhooks](https://developer.paddle.com/webhooks/simulator/test-webhooks)
- **Known gaps.**
  - Chargeback simulation is not documented.
  - The simulator page does not say whether it works in sandbox, live, or both.
