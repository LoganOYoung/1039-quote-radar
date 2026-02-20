# Quotation page: what to show and what to consider

What the customer sees when opening a quote link, plus product/UX/legal considerations.

---

## 1. Content (trade professionalism)

### Already on the page

| Element | Purpose |
|--------|--------|
| Commercial Quotation | Document type. |
| Ref. / Date of issue / Valid until | Traceability and validity. |
| Exchange rate (locked) | Optional; shows rate if seller locked it. |
| Goods description | Product name. |
| Unit price — FOB (Incoterms® 2020), USD | Clear price and trade term. |
| All amounts in USD | Currency. |
| Bill to | Buyer name. |
| Validity & terms | 7-day validity; non-binding until confirmed. |
| Save as PDF / image | Let buyer keep or forward. |

### Optional content (needs data or copy)

| Item | Why | How |
|------|-----|-----|
| **Quantity & unit** | Buyers expect qty (e.g. 10,000 pcs, 40 ctns). | Store `order_quantity` (and optionally packing) on quote; show on view. |
| **Total amount** | Unit × qty. | Compute when quantity is stored. |
| **Port of loading** | FOB needs a port (e.g. FOB Ningbo). | Optional field: `port_of_loading` or free text. |
| **Payment terms** | e.g. T/T 30% advance, 70% before shipment. | Optional field or preset options. |
| **Seller contact** | Address, phone, email for order. | Optional company profile fields. |
| **HS code** | For customs / buyer’s import. | Optional product field. |
| **Remarks / Special terms** | MOQ, lead time, packaging, etc. | Optional free-text field. |
| **CFR / CIF** | If seller filled freight/insurance, show on view. | Store and display when available. |

---

## 2. UX and behavior

| Consideration | Status / suggestion |
|---------------|---------------------|
| **Mobile-friendly** | Responsive layout; tap targets and font size OK. |
| **Print / PDF** | Print styles hide nav and tracking; card prints cleanly. |
| **Save as image** | Uses current card content; consider including Ref + valid until in image. |
| **Loading / error** | Invalid or expired link → 404 with “Back to home”. Consider “Quote expired” vs “Link invalid” if you add expiry. |
| **No layout shift** | Content is server-rendered; minimal CLS. |
| **Link sharing** | OG title/description/image set; copy script is English. |
| **Accessibility** | Semantic HTML (header, article, dl/dt/dd). Consider `lang="en"` on view layout if whole page is EN. |

---

## 3. Security and privacy

| Consideration | Status / suggestion |
|---------------|---------------------|
| **View tracking** | IP/city/UA and duration logged; seller sees in dashboard. |
| **Tracking notice** | Footer: “Viewing of this page may be recorded for security.” |
| **Controlled access** | Optional “Request to View Price”; seller approves in dashboard. |
| **Link guessability** | `short_id` is nanoid(10); acceptable for unlisted links. Optional: expiry or one-time view. |
| **No sensitive data in URL** | Only short_id in path; no token in query. |
| **HTTPS** | Enforced in production. |

---

## 4. Legal and compliance

| Consideration | Suggestion |
|---------------|------------|
| **Contractual force** | Stated as “non-binding until order confirmed by seller”. |
| **Validity** | “Valid for 7 days” (or configurable). |
| **Jurisdiction / governing law** | Optional footer line if needed (e.g. “Subject to laws of PRC”). |
| **Incoterms** | Use “Incoterms® 2020” to align with ICC. |
| **GDPR / privacy** | If EU buyers: clarify in privacy policy that opening the link is logged; consider consent or minimal logging. |

---

## 5. Internationalization and locale

| Consideration | Status / suggestion |
|---------------|---------------------|
| **Language** | Page and copy are English for buyers. |
| **Date format** | en-US (e.g. Feb 20, 2026). Optional: respect Accept-Language or buyer locale. |
| **Currency** | USD only; “All amounts in USD” stated. |
| **Numbers** | No locale-specific number formatting; decimals as needed. |

---

## 6. Performance and SEO

| Consideration | Status / suggestion |
|---------------|---------------------|
| **OG/Twitter** | Title, description, image per quote. |
| **Title** | Product + company or product + price. |
| **Static-friendly** | Dynamic per quote; consider ISR or short cache if traffic grows. |
| **No heavy JS** | View page is mostly static; TrackDuration and export are light. |

---

## 7. Optional product enhancements

- **Quote expiry** — `expires_at` exists; use it to show “This quotation has expired” and hide or blur price.
- **Multi-item lines** — Support multiple products per quote (schema and UI change).
- **PDF with watermark** — e.g. “Ref. xxx · Valid until …” on saved PDF.
- **Dark mode** — If desired for readability; currently light-only.
- **“Contact seller”** — Button or link when company email/phone is set.

---

## Summary

- **Must-have for a professional quote:** Ref, date, validity, goods description, unit price (FOB USD), currency, terms — all present.
- **Worth adding when data exists:** Quantity, total, port of loading, payment terms, seller contact, remarks.
- **Already considered:** Mobile, print, tracking notice, controlled access, English copy, OG, non-binding wording.
