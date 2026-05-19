# Security Specification for SSDI Inventory

## Data Invariants
1. A transaction must reference a valid `productId` and `userId`.
2. `sku` in products must be uppercase and stripped of whitespace (enforced in business logic but rules check type).
3. `stock` must be a non-negative number.
4. `userId` in any document must match `request.auth.uid` unless the action is by an admin.
5. All timestamps must match `request.time`.

## The Dirty Dozen Payloads

1. **Identity Theft (Update User Profile)**
   - Target: `/users/targetAuthId`
   - Payload: `{ "role": "admin" }`
   - Goal: Escalate privilege.
   - Result: `PERMISSION_DENIED`.

2. **Poisoning Category (Long String)**
   - Target: `/categories/new-cat`
   - Payload: `{ "name": "A".repeat(2000) }`
   - Goal: DoS or UI breaking.
   - Result: `PERMISSION_DENIED` (Size check).

3. **Orphaned Transaction**
   - Target: `/transactions/tx1`
   - Payload: `{ "productId": "non-existent", "type": "IN", "quantity": 10, "userId": "attackerUid", "timestamp": request.time }`
   - Goal: Create invalid logs.
   - Result: `PERMISSION_DENIED` (Exists check).

4. **Negative Stock Insertion**
   - Target: `/products/p1`
   - Payload: `{ "stock": -100, ... }`
   - Goal: Break logic.
   - Result: `PERMISSION_DENIED` (Boundary check).

5. **Future Dated Transaction**
   - Target: `/transactions/tx2`
   - Payload: `{ ..., "timestamp": "2099-01-01T00:00:00Z" }`
   - Goal: Break reports.
   - Result: `PERMISSION_DENIED` (Server timestamp check).

6. **Spoofing Owner in Product**
   - Target: `/products/new`
   - Payload: `{ "sku": "S1", "warehouseId": "w1", ... }` but `w1` doesn't exist.
   - Goal: Assign items to nowhere.
   - Result: `PERMISSION_DENIED`.

7. **Anonymous Write**
   - Target: `/categories/cat1`
   - Payload: `{ "name": "Unauthorized" }` (No auth token)
   - Goal: Write without account.
   - Result: `PERMISSION_DENIED`.

8. **Admin Role Self-Assignment on Signup**
   - Target: `/users/myUid`
   - Payload: `{ "name": "Me", "email": "me@example.com", "role": "admin", "createdAt": request.time }`
   - Goal: New users joining as admins.
   - Result: `PERMISSION_DENIED` (Only staff by default or explicit admin gate).

9. **Ghost Field in Transaction**
   - Target: `/transactions/tx3`
   - Payload: `{ ..., "is_deleted": true }`
   - Goal: Inject unauthorized state.
   - Result: `PERMISSION_DENIED` (Map size check).

10. **Bypassing Category Read**
    - Target: `/categories/private`
    - Payload: Read as non-auth user.
    - Result: `PERMISSION_DENIED`.

11. **Updating Transaction Note as Staff**
    - Target: `/transactions/tx4`
    - Payload: `{ "note": "Changing history" }`
    - Goal: Transactions are immutable log.
    - Result: `PERMISSION_DENIED`.

12. **Skewing Stock Update**
    - Target: `/products/p1`
    - Payload: Update `stock` directly without transaction.
    - Goal: Bypassing auditing.
    - Result: `PERMISSION_DENIED` (Update must be batch or specific).

## Test Plan
- Verify all write operations require `request.auth.uid`.
- Verify `isValidId` on all path variables.
- Verify `isValidEntity` on all create/update.
