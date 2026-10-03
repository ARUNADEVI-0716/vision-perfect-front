# Complete the food-ordering interactions

## What will be added
- Connect restaurant selection, categories, and search so each control filters the visible food and restaurant choices.
- Turn every Add control into a shared cart with quantity adjustment, item removal, subtotal, coupon discount, delivery fee, and total.
- Make scheduling validate date, time, and address, then show an editable scheduled-order confirmation.
- Make coupon and instant-order actions open focused dialogs with coupon application and final order confirmation.
- Keep everything frontend-only and in memory, preserving the existing four-panel visual structure and responsive behavior.

## Technical details
- Use local React state and Zod validation; no database, login, or external service.
- Reuse the project’s existing dialog, popover, calendar, and button controls.
- Verify the key flows on desktop and mobile, plus the latest preview build status.
