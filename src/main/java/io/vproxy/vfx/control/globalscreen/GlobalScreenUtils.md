# GlobalScreenUtils.java vs GlobalScreenUtils.ts

## Summary
Utility for managing jnativehook global screen hooks. The TS port stubs out the entire jnativehook subsystem since it's not available in browsers; the reference-counting API is preserved so callers need no changes.

## Verdict
CONSISTENT — the reference-counting API is preserved. The actual global hook functionality is inherently unavailable in the browser (a necessary platform limitation).
