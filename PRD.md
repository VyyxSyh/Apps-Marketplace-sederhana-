# KOLAP: Product Requirements

## Product

KOLAP is a local demo marketplace for buyers, sellers, and warehouse staff. Buyers browse products, manage a cart, place demo orders, and track item-level status. Sellers manage their products and accept or reject each ordered item with a reason. Warehouse staff record stock movements and prepare, pack, and ship accepted items.

The interface is mobile-first, with tablet and desktop layouts supported. A PWA is not implemented.

## Users and capabilities

| Role | Current capabilities |
|---|---|
| Buyer | Browse/filter products, manage cart, place demo orders, view order details, cancel pending seller lines, contact sellers through chat. |
| Seller | Manage own products and profile, review orders containing own items, accept or reject pending items individually, give rejection reasons, chat with buyers. |
| Warehouse | View accepted order items, move eligible items through preparation, packing, and shipping, adjust inventory, view stock movement history. |

## Main workflows

1. Buyer selects products and places a demo checkout order. No payment or real shipping occurs.
2. Each seller processes or rejects their own order lines. Rejection reasons are visible in the buyer's order details. A pending line can be cancelled by its buyer.
3. Warehouse staff move accepted lines through `Diteruskan ke gudang`, `Disiapkan`, `Dikemas`, and `Dikirim`. Stock is deducted when an item is marked shipped.
4. Buyers can view per-seller and per-item status, shipping details, and start a seller chat from order details.

## Runtime and data

- Built with HTML, CSS, and vanilla JavaScript; no npm dependencies.
- Start the local Node.js server with `node server.js`; open `http://127.0.0.1:3000`.
- The server reads and writes JSON files in `data/`, and serves `/api/*` endpoints.
- Browser `localStorage` holds a client-side cache and session marker. It is not an authoritative identity store.
- Demo password hashes are stored in `hash/pw.json` using Node.js scrypt.
- Product images are optional local paths; missing images fall back to product placeholders.
- Google Fonts are loaded externally. Core layout and components use `stylesheet.css`.

## Functional requirements

### Authentication and accounts

- A user can register as a buyer or seller, log in, log out, and update their password.
- Email addresses must be unique. Passwords have a minimum length of six characters.
- Seller profile name and city can be updated.
- Warehouse is a seeded demo role; public registration does not offer warehouse access.
- Role checks currently restrict the UI only. They do not authorize API requests.

### Catalog and cart

- Catalog is accessible without login and supports search, seller selection, category filtering, and sorting.
- Product cards show seller, product name, price, stock, and an image or placeholder.
- A buyer can add available products to a per-user cart, adjust quantities within available stock, or remove items.
- Cart and catalog show empty states when they contain no matching items.

### Checkout and buyer orders

- Checkout requires a recipient name, phone number, shipping address, and a demo payment method.
- Checkout validates current stock, records a product and price snapshot, creates an order number, and empties the buyer's cart.
- Checkout is a simulation. It does not charge a payment method or arrange delivery.
- Buyers can search/filter order history, open order details, view item-level status and rejection reasons, and contact sellers.
- Buyers can cancel a seller's pending portion while that seller has not started processing it.

### Seller orders and products

- Sellers can add, edit, and delete only their own products.
- Sellers can inspect orders containing their products and process or reject each pending line separately.
- Rejection requires a reason of 5–500 characters, saved with the order line and visible to the buyer.
- Processing an accepted line advances it to the warehouse queue.

### Warehouse inventory and fulfillment

- Warehouse users can view stock levels and stock movement history.
- Stock adjustments record product, signed quantity, type, reason, user, and timestamp.
- Accepted order lines move through preparation, packing, and shipping independently, including when lines in the same order are at different stages.
- Stock is deducted and a stock movement recorded at shipping; active order reservations constrain stock corrections.

### Chat

- Buyers can initiate a conversation with a seller from a product or order.
- Buyers and sellers can view and send messages in their conversations.

## Non-functional requirements

- Layout must reflow without horizontal overflow on mobile, tablet, and desktop.
- Interactive elements must be keyboard-operable, visibly focused, and have accessible names. Form fields use visible labels and clear validation feedback.
- Data views should provide suitable loading, empty, and error states.
- Text contrast should meet WCAG AA: 4.5:1 for normal text and 3:1 for large text.
- Product media reserves space using intrinsic dimensions or aspect ratio; non-critical images may lazy-load.
- No performance or reliability target is claimed without measurement.

## Security limitation

This application is for local demonstration only. The server binds to loopback, but `/api/data` and `/api/users` write endpoints do not validate a server-managed session or authorize roles. The browser session marker is user-editable and must not be trusted by the server. Do not expose the server to a network or use real personal, account, payment, or order data. Production use requires server-managed authentication, role-scoped API operations, and server-side input validation.

## Out of scope

- Real payment processing, shipping integration, and refunds.
- PWA installation/offline support.
- Public deployment or production-grade security.
- Persistent database, product reviews, ratings, and native mobile apps.

## Acceptance checks

- Buyer can place a demo order and see its details and line statuses after refresh.
- Seller can process one pending item without changing other sellers' lines; rejecting an item requires a reason that appears to the buyer.
- Buyer can cancel only a still-pending seller portion.
- Warehouse can perform stock adjustments once per submission and advance mixed-stage lines independently.
- Shipping an accepted line deducts its quantity once and records a stock movement.
- Catalog search, filters, cart quantity controls, and navigation work at mobile and desktop widths without horizontal overflow.
- Keyboard navigation, focus visibility, dialog dismissal, labels, and error feedback work across buyer, seller, and warehouse screens.
- API write authorization remains a known blocker; the app is not safe to expose beyond local loopback use.
