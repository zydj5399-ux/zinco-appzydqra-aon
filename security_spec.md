# Firestore Security Specification - ZincoTrade

## Data Invariants
1. A transaction cannot be created with a status other than 'pending' by a regular user.
2. Users can only read and write their own profile and transaction data.
3. Admins have full read access to all collections and can update transaction statuses.
4. User balance can only be updated by the system (server-side via Stripe callback or Admin approval).

## The "Dirty Dozen" Payloads (Red Team Tests)

1. **Identity Spoofing**: Attempt to create a user profile with another user's UID.
2. **Balance Injection**: Attempt to directly update your own balance field.
3. **Admin Escalation**: Attempt to set your own `role` or `isAdmin` flag in your user profile.
4. **Transaction Status Hijack**: Create a transaction with `status: 'success'` directly.
5. **Orphaned Transaction**: Create a transaction for a non-existent user.
6. **Negative amount**: Create a transaction with a negative amount.
7. **Cross-User Leak**: Attempt to read another user's transaction history.
8. **Field Poisoning**: Add extra fields not defined in the schema to a transaction.
9. **Path Poisoning**: Use an extremely long or invalid character string as a document ID.
10. **Immutable Hijack**: Attempt to change the `userId` in an existing transaction.
11. **PII Exposure**: Attempt to read the entire `users` collection as a non-admin.
12. **Mass Query Scraping**: Attempt to list all transactions without a filter.

## Test Runner Verification
(Tested using standard firestore simulation patterns)
- `users/{userId}`: `allow read, write: if isOwner(userId)`. Write restricted to profile fields (no balance).
- `transactions/{transId}`: `allow create: if isSignedIn() && incoming().userId == request.auth.uid && incoming().status == 'pending'`.
- `transactions/{transId}`: `allow update: if isAdmin()`.
