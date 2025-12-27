# UI Patterns: Loaders & Skeletons

This doc outlines rules and examples for loaders, skeletons and progress indicators.

## Rules
- Debounce: show loader only if request lasts > 200ms to avoid flicker.
- Use inline spinners for actions (buttons), small appbar indicators for background syncs.
- Use skeletons for lists, cards and forms when content is loaded from the API.
- Respect `prefers-reduced-motion` and theme variables for colors.

## Components to implement
- `LoadingButton` — button with small spinner and disabled state when submitting.
- `SkeletonLoader` — configurable rows/types: `card`, `list`, `form`.
- `LoadingService` + `LoadingInterceptor` — centralize loading state and per-key loading.
