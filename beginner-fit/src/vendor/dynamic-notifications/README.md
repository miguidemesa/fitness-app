# dynamic-notifications (vendored)

Dynamic Island–style in-app notifications, copied from
[rit3zh/expo-dynamic-notifications](https://github.com/rit3zh/expo-dynamic-notifications) (MIT, see LICENSE)
on 2026-10-09. It is a template, not an npm package, so the core lives here. Imports were rewritten from `@/…`
to `@/vendor/dynamic-notifications/…`; the demo screens and `react-native-teleport` were left out.

Capy patches (search for "Capy patch"):
- `overlay.tsx`: render nothing while no notification is out (upstream always paints the island pill).
- `use-notification-timeline.ts`: with Reduce Motion, fade the card instead of the goo morph.

App code should use `src/components/notify.tsx`, not this folder directly.
