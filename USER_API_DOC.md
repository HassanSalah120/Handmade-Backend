# Handmade Platform API Documentation (User Endpoints - v1)

This document provides details about the API endpoints relevant for a standard **User** of the Handmade Platform, intended for use by the Flutter frontend development team.

**Base URL:** `/api/v1`

**Authentication:** Most protected endpoints require a JSON Web Token (JWT) to be sent in the `Authorization` header:
`Authorization: Bearer <your_jwt_token>`

---

## Authentication (`/users`)

### 1. Sign Up

*   **Method:** `POST`
*   **URL:** `/users/signUp`
*   **Description:** Creates a new user account (defaults to 'user' role).
*   **Auth:** No
*   **Request Body:**
    ```json
    {
      "name": "Test User",
      "email": "test@example.com",
      "password": "password123",
      "passwordConfirm": "password123"
    }
    ```
*   **Success Response (201 Created):** Returns user object and JWT token.
    ```json
    {
      "status": "Success",
      "token": "jwt_token_here",
      "data": { ...user object... }
    }
    ```
*   **Errors:** 400 (Validation errors, Email already exists).

### 2. Login

*   **Method:** `POST`
*   **URL:** `/users/login`
*   **Description:** Logs in an existing user.
*   **Auth:** No
*   **Request Body:**
    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```
*   **Success Response (200 OK):** Returns status and JWT token.
    ```json
    {
      "status": "Success",
      "token": "jwt_token_here"
    }
    ```
*   **Errors:** 401 (Incorrect email/password).

### 3. Forgot Password

*   **Method:** `POST`
*   **URL:** `/users/forgotPassword`
*   **Description:** Sends a password reset token to the user's email.
*   **Auth:** No
*   **Request Body:** `{"email": "user@example.com"}`
*   **Success Response (200 OK):** Returns confirmation message.
    ```json
    {
      "status": "Success",
      "message": "Token sent to email!"
    }
    ```
*   **Errors:** 404 (User not found), 500 (Email sending error).

### 4. Reset Password

*   **Method:** `PATCH`
*   **URL:** `/users/resetPassword/:token`
*   **Description:** Resets password using the email token.
*   **Auth:** No
*   **Path Parameter:** `:token` (Password reset token from email)
*   **Request Body:** `{"password": "newPass", "passwordConfirm": "newPass"}`
*   **Success Response (200 OK):** Returns status and new JWT token.
    ```json
    {
      "status": "Success",
      "token": "new_jwt_token_here"
    }
    ```
*   **Errors:** 400 (Invalid/Expired token).

---

## User Profile (`/users`)

### 1. Get My Profile

*   **Method:** `GET`
*   **URL:** `/users/me`
*   **Description:** Retrieves the profile details of the logged-in user.
*   **Auth:** Required
*   **Success Response (200 OK):** Returns user data (excluding password, active status).
    ```json
    {
      "status": "Success",
      "data": {
        "_id": "user_id",
        "name": "Test User",
        // ... other fields like email, role, wishlist IDs, addresses ...
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    }
    ```
*   **Errors:** 401 (Invalid/Missing token).

### 2. Update My Profile

*   **Method:** `PATCH`
*   **URL:** `/users/updateMe`
*   **Description:** Updates logged-in user's profile info (name, email, phone). Use `multipart/form-data` for photo uploads (field name: `profile_picture`).
*   **Auth:** Required
*   **Request Body:** Fields to update (e.g., `{"name": "New Name"}`). Cannot update password here.
*   **Success Response (200 OK):** Returns updated user object.
    ```json
    {
      "status": "Success", // Note: Controller currently returns only { data: user }
      "data": { ...updated user object... }
    }
    ```
*   **Errors:** 401 (Invalid/Missing token), 400 (Validation errors, Attempt to update password).

### 3. Update My Password

*   **Method:** `PATCH`
*   **URL:** `/users/updateMyPassword`
*   **Description:** Updates the logged-in user's password.
*   **Auth:** Required
*   **Request Body:**
    ```json
    {
      "currentPassword": "oldPassword123",
      "password": "newPassword123",
      "passwordConfirm": "newPassword123"
    }
    ```
*   **Success Response (200 OK):** Returns status and new JWT token.
    ```json
    {
      "status": "Success",
      "token": "new_jwt_token_here"
    }
    ```
*   **Errors:** 401 (Incorrect current password), 400 (Validation errors), 401 (Missing token).

### 4. Deactivate My Account

*   **Method:** `DELETE`
*   **URL:** `/users/deleteMe`
*   **Description:** Sets the user's account to inactive (`active: false`).
*   **Auth:** Required
*   **Success Response (204 No Content):** No body.
*   **Errors:** 401 (Invalid/Missing token).

---

## Browsing (`/products`, `/categories`, `/subCategories`)

### 1. Get All Products

*   **Method:** `GET`
*   **URL:** `/products`
*   **Description:** Retrieves products with filtering, sorting, pagination, search.
*   **Auth:** No
*   **Query Parameters:** `limit`, `page`, `sort`, `fields`, `keyword`, `category`, `subCategories`, `price[gte]`, `price[lte]`, `ratingsAverage[gte]`.
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "results": ...,
      "paginationResult": { ... },
      "data": [ { ...product object... }, ... ]
    }
    ```

### 2. Get Single Product

*   **Method:** `GET`
*   **URL:** `/products/:id`
*   **Description:** Retrieves details for a specific product.
*   **Auth:** No
*   **Path Parameter:** `:id` (Product ID)
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "data": { ...product object... }
    }
    ```
*   **Errors:** 404 (Product not found).

### 3. Get All Categories

*   **Method:** `GET`
*   **URL:** `/categories`
*   **Description:** Retrieves all product categories.
*   **Auth:** No
*   **Query Parameters:** `limit`, `page`.
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "results": ...,
      "paginationResult": { ... },
      "data": [ { ...category object... }, ... ]
    }
    ```

### 4. Get Single Category

*   **Method:** `GET`
*   **URL:** `/categories/:id`
*   **Description:** Retrieves details for a specific category.
*   **Auth:** No
*   **Path Parameter:** `:id` (Category ID)
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "data": { ...category object... }
    }
    ```
*   **Errors:** 404 (Category not found).

### 5. Get All Subcategories

*   **Method:** `GET`
*   **URL:** `/subCategories`
*   **Description:** Retrieves subcategories, filterable by parent category ID.
*   **Auth:** No
*   **Query Parameters:** `limit`, `page`, `category`.
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "results": ...,
      "paginationResult": { ... },
      "data": [ { ...subcategory object... }, ... ]
    }
    ```

### 6. Get Single Subcategory

*   **Method:** `GET`
*   **URL:** `/subCategories/:id`
*   **Description:** Retrieves details for a specific subcategory.
*   **Auth:** No
*   **Path Parameter:** `:id` (Subcategory ID)
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "data": { ...subcategory object... }
    }
    ```
*   **Errors:** 404 (Subcategory not found).

---

## Reviews (`/reviews`, `/products/:productId/reviews`)

### 1. Get Reviews for a Product

*   **Method:** `GET`
*   **URL:** `/products/:productId/reviews`
*   **Description:** Retrieves reviews for a specific product.
*   **Auth:** No
*   **Path Parameter:** `:productId` (Product ID)
*   **Success Response (200 OK):** Returns review list and pagination info.

### 2. Create Review

*   **Method:** `POST`
*   **URL:** `/products/:productId/reviews`
*   **Description:** Adds a new review for a product by the logged-in user.
*   **Auth:** Required (User role)
*   **Path Parameter:** `:productId` (Product ID)
*   **Request Body:** `{"rating": 5, "title": "Optional Title"}`
*   **Success Response (201 Created):** Returns the new review object.
*   **Errors:** 400 (Validation errors, Already reviewed), 401 (Missing token).

### 3. Update My Review

*   **Method:** `PATCH`
*   **URL:** `/reviews/:id`
*   **Description:** Updates a review written by the logged-in user.
*   **Auth:** Required (User must own the review)
*   **Path Parameter:** `:id` (Review ID)
*   **Request Body:** Fields to update (e.g., `{"rating": 4}`).
*   **Success Response (200 OK):** Returns updated review object.
*   **Errors:** 403 (User doesn't own review), 404 (Review not found), 401 (Missing token).

### 4. Delete My Review

*   **Method:** `DELETE`
*   **URL:** `/reviews/:id`
*   **Description:** Deletes a review written by the logged-in user.
*   **Auth:** Required (User must own the review)
*   **Path Parameter:** `:id` (Review ID)
*   **Success Response (204 No Content):** No body.
*   **Errors:** 403 (User doesn't own review), 404 (Review not found), 401 (Missing token).

---

## Wishlist (`/wishLists`)

### 1. Add Product to Wishlist

*   **Method:** `POST`
*   **URL:** `/wishLists`
*   **Description:** Adds a product to the user's wishlist.
*   **Auth:** Required
*   **Request Body:** `{"productId": "product_id_here"}`
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "message": "Product added successfully to wishlist",
      "data": [ ...updated list of product IDs... ]
    }
    ```
*   **Errors:** 400 (Product already in wishlist), 404 (Product ID not found), 401 (Missing token).

### 2. Get My Wishlist

*   **Method:** `GET`
*   **URL:** `/wishLists`
*   **Description:** Retrieves the user's wishlist (populated with product details).
*   **Auth:** Required
*   **Success Response (200 OK):** Returns list of product objects in wishlist.
    ```json
    {
      "status": "success",
      "results": ...,
      "data": [ { ...product object... }, ... ]
    }
    ```
*   **Errors:** 401 (Missing token).

### 3. Remove Product from Wishlist

*   **Method:** `DELETE`
*   **URL:** `/wishLists/:productId`
*   **Description:** Removes a product from the user's wishlist.
*   **Auth:** Required
*   **Path Parameter:** `:productId` (Product ID to remove)
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "message": "Product removed successfully from wishlist",
      "data": [ ...updated list of product IDs... ]
    }
    ```
*   **Errors:** 404 (Product not in wishlist or user not found), 401 (Missing token).

---

## Addresses (`/addresses`)

### 1. Add Address

*   **Method:** `POST`
*   **URL:** `/addresses`
*   **Description:** Adds a new shipping address for the user.
*   **Auth:** Required
*   **Request Body:**
    ```json
    {
      "alias": "Home",
      "details": "123 St",
      "phone": "555-1",
      "city": "City",
      "postalCode": "123"
    }
    ```
*   **Success Response (200 OK):** Returns confirmation message and full list of user's addresses.
    ```json
    {
      "status": "Success",
      "message": "Address added successfully",
      "data": [ { ...address object... }, ... ]
    }
    ```
*   **Errors:** 400 (Validation errors), 401 (Missing token).

### 2. Get My Addresses

*   **Method:** `GET`
*   **URL:** `/addresses`
*   **Description:** Retrieves all saved addresses for the user.
*   **Auth:** Required
*   **Success Response (200 OK):** Returns list of address objects.
    ```json
    {
      "status": "Success",
      "results": ...,
      "data": [ { ...address object... }, ... ]
    }
    ```
*   **Errors:** 401 (Missing token).

### 3. Remove Address

*   **Method:** `DELETE`
*   **URL:** `/addresses/:addressId`
*   **Description:** Removes a specific address.
*   **Auth:** Required
*   **Path Parameter:** `:addressId` (MongoDB ID of the address within the user's `addresses` array)
*   **Success Response (200 OK):** Returns confirmation message and updated list of addresses.
    ```json
    {
      "status": "Success",
      "message": "Address removed successfully",
      "data": [ { ...address object... }, ... ]
    }
    ```
*   **Errors:** 404 (Address not found for user), 401 (Missing token).

---

## Shopping Cart (`/carts`)

### 1. Add Item to Cart

*   **Method:** `POST`
*   **URL:** `/carts`
*   **Description:** Adds a product to the cart. Creates a cart if one doesn't exist for the user.
*   **Auth:** Required
*   **Request Body:** `{"productId": "product_id_here", "color": "Red"}`
*   **Success Response (200 OK):**
    ```json
    {
      "status": "Success",
      "message": "Product added to cart successfully",
      "numOfCartItems": ...,
      "data": { ...updated cart object... }
    }
    ```
*   **Errors:** 404 (Product not found), 400 (Product out of stock), 401 (Missing token).

### 2. Get My Cart

*   **Method:** `GET`
*   **URL:** `/carts`
*   **Description:** Retrieves the user's current cart. Returns an empty representation if no cart exists.
*   **Auth:** Required
*   **Success Response (200 OK):**
    ```json
    // If cart exists:
    {
      "status": "Success",
      "numOfCartItems": ...,
      "data": { ...cart object... }
    }
    // If cart doesn't exist:
    {
      "status": "Success",
      "numOfCartItems": 0,
      "data": { "cartItems": [], "totalCartPrice": 0, "_id": null, "user": "user_id" }
    }
    ```
*   **Errors:** 401 (Missing token).

### 3. Remove Item from Cart

*   **Method:** `DELETE`
*   **URL:** `/carts/:itemId`
*   **Description:** Removes a specific item from the cart.
*   **Auth:** Required
*   **Path Parameter:** `:itemId` (MongoDB ID of the item within `cartItems` array)
*   **Success Response (200 OK):** Returns item count and updated cart data.
*   **Errors:** 404 (Cart/Item not found), 401 (Missing token).

### 4. Update Item Quantity

*   **Method:** `PATCH`
*   **URL:** `/carts/:itemId`
*   **Description:** Updates the quantity of an item in the cart.
*   **Auth:** Required
*   **Path Parameter:** `:itemId` (MongoDB ID of the item within `cartItems` array)
*   **Request Body:** `{"quantity": 3}`
*   **Success Response (200 OK):** Returns item count and updated cart data.
*   **Errors:** 404 (Cart/Item not found), 401 (Missing token).

### 5. Clear Cart

*   **Method:** `DELETE`
*   **URL:** `/carts`
*   **Description:** Removes all items and deletes the cart document.
*   **Auth:** Required
*   **Success Response (204 No Content):** No body.
*   **Errors:** 401 (Missing token).

### 6. Apply Coupon

*   **Method:** `PATCH`
*   **URL:** `/carts/applyCoupon`
*   **Description:** Applies a discount coupon to the cart.
*   **Auth:** Required
*   **Request Body:** `{"name": "COUPONCODE"}`
*   **Success Response (200 OK):** Returns item count and updated cart data with discount.
*   **Errors:** 404 (Cart not found), 400 (Coupon invalid/expired), 401 (Missing token).

---

## Orders (`/orders`)

### 1. Create Cash Order

*   **Method:** `POST`
*   **URL:** `/orders/:cartId`
*   **Description:** Creates a Cash on Delivery order from the specified cart.
*   **Auth:** Required (User role)
*   **Path Parameter:** `:cartId` (Cart ID)
*   **Request Body:** `{"shippingAddress": { ...address details... }}`
*   **Success Response (201 Created):** Returns the new order object (`isPaid: false`).
*   **Errors:** 404 (Cart not found), 400 (Insufficient stock), 401 (Missing token).

### 2. Create Stripe Checkout Session

*   **Method:** `GET` (*Note: Frontend might need to send shippingAddress in body if required*)
*   **URL:** `/orders/checkout-session/:cartId`
*   **Description:** Initiates a Stripe payment session for the given cart.
*   **Auth:** Required
*   **Path Parameter:** `:cartId` (Cart ID)
*   **Request Body (Optional):** `{"shippingAddress": {...}, "successUrl": "...", "cancelUrl": "..."}`
*   **Success Response (200 OK):** Returns Stripe `session` object containing `id`.
    *   **Frontend Action:** Use `session.id` with `stripe.redirectToCheckout()`.
*   **Errors:** 404 (Cart not found), 401 (Missing token).

### 3. Get My Orders

*   **Method:** `GET`
*   **URL:** `/orders`
*   **Description:** Retrieves a list of orders placed by the logged-in user.
*   **Auth:** Required
*   **Query Parameters:** `limit`, `page`.
*   **Success Response (200 OK):** Returns list of user's orders and pagination info.
*   **Errors:** 401 (Missing token).

---

## Checkout Result (Backend Redirect Target)

*   **Method:** `GET`
*   **URL:** `/checkout-result`
*   **Description:** Endpoint where Stripe redirects after payment attempt. Processes the result and **redirects the browser** to the appropriate frontend page (e.g., `http://127.0.0.1:5500/pages/order-success.html?orderId=xyz`). **Flutter frontend usually doesn't interact with this directly.** It handles the page loaded after the redirect.
*   **Auth:** No
*   **Query Parameters:** `status` (`success`/`cancel`), `session_id` (if success).

---

## Static Files (Images)

*   **URL Structure:** `/img/users/<image_filename.jpeg>` or `/img/products/<image_filename.jpeg>` etc.
*   **Description:** Access uploaded images directly via their path within the `public` directory.
*   **Example:** `http://localhost:3000/img/users/user-6812e0412703c9362227709b-1746407180873.jpeg` 