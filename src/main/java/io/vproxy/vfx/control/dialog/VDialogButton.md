# VDialogButton.java vs VDialogButton.ts

## Summary
Data class representing a button in a VDialog, holding a name, an optional value provider, and a reference to the actual button widget.

## Verdict
CONSISTENT — The constructor dispatch logic correctly replicates the Java overload behavior. All three call patterns (value, provider function, no-provider) are preserved.
