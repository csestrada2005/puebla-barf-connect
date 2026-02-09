
# Fix: Guest Checkout "Error al crear pedido"

## Root Cause

There are **two issues** causing the error:

1. **Address length mismatch**: The database has a CHECK constraint requiring `customer_address` to be at least 10 characters long. However, the recent change to split the address into "Direccion", "Colonia", and "CP" fields means the short address alone may be under 10 characters. The Zod schema only requires 5 characters minimum, so validation passes but the database rejects it.

2. **Address not combined**: The order payload sends only `formData.address` to `customer_address`, without including the colonia and postal code. The full address should be a combination of all three fields.

## Solution

**File: `src/pages/Checkout.tsx`**

1. **Combine address fields** before inserting into the database. Build the `customer_address` value by joining `address`, `colonia`, and `postal_code`:
   ```
   "Calle 5 #10, Col. Centro, CP 72000"
   ```

2. **Update Zod validation** to ensure the combined address will always meet the 10-character minimum (require `address` to have at least 5 chars AND `colonia` to be required with at least 3 chars).

3. **Make `colonia` required** in the Zod schema (since it's needed for delivery anyway).

### Changes in detail

- In the `checkoutSchema`, change `colonia` from optional to required with a minimum of 3 characters.
- In `handleSubmit`, build the combined address:
  ```typescript
  const fullAddress = [formData.address, formData.colonia, formData.postal_code]
    .filter(Boolean)
    .join(", ");
  ```
- Use `fullAddress` in the order payload for `customer_address` (line 225).
- Use `fullAddress` in the WhatsApp message instead of just the short address.

This ensures the database constraint is always satisfied and the order contains the complete delivery address.
