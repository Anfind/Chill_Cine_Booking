# Fix Next.js 15 Params Warning

## Issue
```
A param property was accessed directly with `params.roomId`. 
`params` is now a Promise and should be unwrapped with `React.use()` 
before accessing properties of the underlying params object.
```

## Root Cause
Next.js 15 changed the behavior of dynamic route params:
- **Before (Next.js 14):** `params` was a plain object
- **After (Next.js 15):** `params` is now a Promise

## Solution

### For Client Components (use `React.use()`)

**Before:**
```typescript
"use client"
import { useState, useEffect } from "react"

export default function BookingPage({ 
  params 
}: { 
  params: { roomId: string } 
}) {
  const { roomId } = params  // ❌ Direct access
  // ...
}
```

**After:**
```typescript
"use client"
import { useState, useEffect, use } from "react"  // ✅ Import 'use'

export default function BookingPage({ 
  params 
}: { 
  params: Promise<{ roomId: string }>  // ✅ Promise type
}) {
  const { roomId } = use(params)  // ✅ Unwrap with use()
  // ...
}
```

### For Server Components (use `await`)

**Example (already correct in our codebase):**
```typescript
// app/rooms/[branchId]/page.tsx
export default async function RoomsPage({ 
  params 
}: { 
  params: Promise<{ branchId: string }> 
}) {
  const { branchId } = await params  // ✅ Await in async function
  // ...
}
```

## Files Fixed

1. ✅ `app/booking/[roomId]/page.tsx` - Changed to use `use(params)`
2. ✅ `app/rooms/[branchId]/page.tsx` - Already using `await params` (server component)

## Key Differences

| Component Type | Import | Unwrap Method | Function Type |
|---------------|---------|---------------|--------------|
| **Client Component** | `import { use }` | `use(params)` | Regular function |
| **Server Component** | No import needed | `await params` | Async function |

## Testing

After fix, the warning should be gone. Test by:
1. Navigate to booking page: `/booking/[roomId]`
2. Check browser console - no warnings ✅
3. Check terminal - no compilation warnings ✅

## References

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React.use() Hook Documentation](https://react.dev/reference/react/use)

---

**Fixed:** October 15, 2025  
**Status:** ✅ Complete - No warnings
