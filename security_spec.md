# Firestore Security Specification

This security specification details the access control policies, threat scenarios, and data validation rules for the SDGs Clubs platform.

## 1. Data Invariants

1. **Club Profiles (`/clubs/{clubId}`)**:
   - Only registered users can write profile data.
   - A club name, institution, and level cannot be blank.
   - Score values must always be positive integers.
   - Any modifications must be checked against structural schema validation keys.

2. **Lounge Messages (`/loungeMessages/{msgId}`)**:
   - Any signed-in user can read the chatter feed.
   - Creation requires verification that the user represents a certified chapter, with accurate payload timestamps.

---

## 2. The "Dirty Dozen" Threat Payloads

The following payloads present potential threat vectors that must be actively blocked by our security policies:

1. **Identity Spoofing**: Attempt to update a club's email or representative name by a different authenticated user.
2. **Resource Poisoning**: Writing a massive metadata description of size exceeding 2MB.
3. **Ghost Fields Injection**: Setting hidden system properties like `isVerified: true` directly.
4. **Privilege Escalation**: Attempting to alter access levels or system administration privileges.
5. **Denial of Wallet**: Modifying other fields at random to cause excessive read triggers.
6. **Negative Value Manipulation**: Setting score or members counts to below zero.
7. **Invalid Format Exploits**: Sending malformed characters or emojis on database IDs.
8. **Orphaned Writes**: Inserting lounge replies with references to non-existent chapters.
9. **Null Value Clears**: Creating a club document where required fields such as `name` or `level` are null.
10. **Timestamp Tampering**: Injecting manual future timestamps rather than relying on server synchronized clocks.
11. **Mass Deletions**: Unauthenticated client triggers attempting to delete the entire database.
12. **Out of bounds tags**: Forcing invalid SDG tags from client browsers.

---

## 3. Test Runner Design

All twelve payload patterns are validated using our strict security rules, ensuring any attempt triggers a standard `PERMISSION_DENIED` status constraint automatically.
