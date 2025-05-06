# Handmade Platform API Documentation (Admin Endpoints - v1)

This document provides details about the API endpoints relevant for an **Administrator** of the Handmade Platform, intended for use by the Flutter frontend development team. Administrators have all the capabilities of Artisans and Users, plus additional permissions for managing users and accessing specific dashboard statistics.

**Base URL:** `/api/v1`

**Authentication:** All Admin endpoints require a JSON Web Token (JWT) with Admin privileges, sent in the `Authorization` header:
`Authorization: Bearer <your_admin_jwt_token>`

---

## User & Artisan Endpoints (Also Available to Admins)

Administrators can use all endpoints documented in `USER_API_DOC.md` and `ARTISAN_API_DOC.md`, including:

*   All Authentication and User Profile actions.
*   All Product, Category, Subcategory, and Coupon management actions.
*   All Review, Wishlist, Address, and Cart actions.
*   Placing orders and viewing all orders.

### Order Status Updates (Shared with Artisans)

Admins can use their token for the following:

*   **Mark Order as Paid:**
    *   **Method:** `PUT`
    *   **URL:** `/orders/:id/pay`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Order ID)
    *   **Request Body:** None.
    *   **Success Response (200 OK):** Returns the updated order object.
    *   **Errors:** 404 (Order not found).

*   **Mark Order as Delivered:**
    *   **Method:** `PUT`
    *   **URL:** `/orders/:id/deliver`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Order ID)
    *   **Request Body:** None.
    *   **Success Response (200 OK):** Returns the updated order object.
    *   **Errors:** 404 (Order not found).

### Category Management (Shared with Artisans)

Admins can perform full CRUD on Categories using their token:

*   **Get All Categories:**
    *   **Method:** `GET`
    *   **URL:** `/categories`
    *   **Auth:** Public
    *   **Success Response (200 OK):** Array of category objects.

*   **Get One Category:**
    *   **Method:** `GET`
    *   **URL:** `/categories/:id`
    *   **Auth:** Public
    *   **Path Parameter:** `:id` (Category ID)
    *   **Success Response (200 OK):** Single category object.

*   **Create Category:**
    *   **Method:** `POST`
    *   **URL:** `/categories`
    *   **Auth:** Admin, Artisan
    *   **Request Body:** `{ "name": "Category Name" }`
    *   **Success Response (201 Created):** The created category object.
    *   **Errors:** 400 (Validation).

*   **Update Category:**
    *   **Method:** `PATCH`
    *   **URL:** `/categories/:id`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Category ID)
    *   **Request Body:** `{ "name": "Updated Category Name" }`
    *   **Success Response (200 OK):** The updated category object.
    *   **Errors:** 404 (Not found), 400 (Validation).

*   **Delete Category:**
    *   **Method:** `DELETE`
    *   **URL:** `/categories/:id`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Category ID)
    *   **Success Response (204 No Content):** No body.
    *   **Errors:** 404 (Not found).

### Subcategory Management (Shared with Artisans)

Admins can perform full CRUD on Subcategories using their token:

*   **Get All Subcategories:**
    *   **Method:** `GET`
    *   **URL:** `/subcategories` (for all) OR `/categories/:categoryId/subcategories` (filtered by parent category)
    *   **Auth:** Public
    *   **Path Parameter (Optional):** `:categoryId`
    *   **Success Response (200 OK):** Array of subcategory objects.

*   **Get One Subcategory:**
    *   **Method:** `GET`
    *   **URL:** `/subcategories/:id`
    *   **Auth:** Public
    *   **Path Parameter:** `:id` (Subcategory ID)
    *   **Success Response (200 OK):** Single subcategory object.

*   **Create Subcategory:**
    *   **Method:** `POST`
    *   **URL:** `/subcategories` OR `/categories/:categoryId/subcategories`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter (Optional):** `:categoryId` (If used, `category` in body is optional)
    *   **Request Body:** `{ "name": "Subcategory Name", "category": "parent_category_id" }` (category ID required if not in URL path)
    *   **Success Response (201 Created):** The created subcategory object.
    *   **Errors:** 400 (Validation).

*   **Update Subcategory:**
    *   **Method:** `PATCH`
    *   **URL:** `/subcategories/:id`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Subcategory ID)
    *   **Request Body:** `{ "name": "Updated Subcategory Name", "category": "optional_new_parent_category_id" }`
    *   **Success Response (200 OK):** The updated subcategory object.
    *   **Errors:** 404 (Not found), 400 (Validation).

*   **Delete Subcategory:**
    *   **Method:** `DELETE`
    *   **URL:** `/subcategories/:id`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Subcategory ID)
    *   **Success Response (204 No Content):** No body.
    *   **Errors:** 404 (Not found).

### Coupon Management (Shared with Artisans)

Admins can perform full CRUD on Coupons using their token, identical to Artisan permissions:

*   **Create Coupon:**
    *   **Method:** `POST`
    *   **URL:** `/coupons`
    *   **Auth:** Admin, Artisan
    *   **Request Body (JSON):** `{"name": "SUMMER25", "expire": "YYYY-MM-DD", "discount": 25}`. (`name` should be unique).
    *   **Success Response (201 Created):** Returns the new coupon object.
    *   **Errors:** 400 (Validation errors), 401/403 (Auth errors).

*   **Get All Coupons:**
    *   **Method:** `GET`
    *   **URL:** `/coupons`
    *   **Auth:** Admin, Artisan
    *   **Success Response (200 OK):** Returns list of coupon objects.

*   **Get Single Coupon:**
    *   **Method:** `GET`
    *   **URL:** `/coupons/:id`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Coupon ID)
    *   **Success Response (200 OK):** Returns coupon object.
    *   **Errors:** 404 (Coupon not found).

*   **Update Coupon:**
    *   **Method:** `PATCH`
    *   **URL:** `/coupons/:id`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Coupon ID)
    *   **Request Body (JSON):** Fields to update (e.g., `{"expire": "YYYY-MM-DD", "discount": 30}`).
    *   **Success Response (200 OK):** Returns the updated coupon object.
    *   **Errors:** 404 (Coupon not found), 400 (Validation errors), 401/403 (Auth errors).

*   **Delete Coupon:**
    *   **Method:** `DELETE`
    *   **URL:** `/coupons/:id`
    *   **Auth:** Admin, Artisan
    *   **Path Parameter:** `:id` (Coupon ID)
    *   **Success Response (204 No Content):** No body.
    *   **Errors:** 404 (Coupon not found), 401/403 (Auth errors).

---

## Admin-Specific Endpoints

### User Management (`/users`)

*   **Method:** `GET`
*   **URL:** `/users`
*   **Description:** Retrieves a list of all users (users, artisans, admins).
*   **Auth:** Admin Only
*   **Query Parameters:** `limit`, `page`, `sort`, `keyword` (for name/email search), etc.
*   **Success Response (200 OK):** Returns user list and pagination info.

*   **Method:** `POST`
*   **URL:** `/users`
*   **Description:** Creates a new user (can specify role: 'user', 'artisan', 'admin').
*   **Auth:** Admin Only
*   **Request Body:** User details including `name`, `email`, `password`, `passwordConfirm`, `role`.
*   **Success Response (201 Created):** Returns the newly created user object.
*   **Errors:** 400 (Validation errors).

*   **Method:** `GET`
*   **URL:** `/users/:id`
*   **Description:** Retrieves details for a specific user by ID.
*   **Auth:** Admin Only
*   **Path Parameter:** `:id` (User ID)
*   **Success Response (200 OK):** Returns user object.
*   **Errors:** 404 (User not found).

*   **Method:** `PATCH`
*   **URL:** `/users/:id`
*   **Description:** Updates details for a specific user (including role).
*   **Auth:** Admin Only
*   **Path Parameter:** `:id` (User ID)
*   **Request Body:** Fields to update (e.g., `{"name": "New Name", "role": "artisan"}`).
*   **Success Response (200 OK):** Returns updated user object.
*   **Errors:** 404 (User not found), 400 (Validation errors).

*   **Method:** `DELETE`
*   **URL:** `/users/:id`
*   **Description:** Deletes a specific user account.
*   **Auth:** Admin Only
*   **Path Parameter:** `:id` (User ID)
*   **Success Response (204 No Content):** No body.
*   **Errors:** 404 (User not found).

### Order Management (`/orders`)

*   **Method:** `DELETE`
*   **URL:** `/orders/:id`
*   **Description:** Deletes a specific order.
*   **Auth:** Admin Only
*   **Path Parameter:** `:id` (Order ID)
*   **Success Response (204 No Content):** No body.
*   **Errors:** 404 (Order not found).

### Admin Dashboard (`/admin`)

#### 1. Get Dashboard Statistics

*   **Method:** `GET`
*   **URL:** `/admin/statistics`
*   **Description:** Retrieves aggregated statistics for the main dashboard view.
*   **Auth:** Admin Only
*   **Success Response (200 OK):**
    ```json
    {
      "status": "success",
      "data": {
        "orders": { "total": ..., "pending": ..., "completed": ... },
        "revenue": { "total": ..., "avgOrderValue": ... },
        "users": { "total": ..., "customers": ..., "artisans": ..., "admins": ... },
        "products": { "total": ... },
        "monthlyRevenue": [ { "month": ..., "revenue": ..., "count": ... }, ... ] // Current year
      }
    }
    ```

#### 2. Get Categories Distribution

*   **Method:** `GET`
*   **URL:** `/admin/categories/distribution`
*   **Description:** Retrieves product counts and percentage distribution per category.
*   **Auth:** Admin Only
*   **Success Response (200 OK):**
    ```json
    {
      "status": "success",
      "data": {
        "categories": [ { "_id": ..., "name": ..., "productCount": ..., "percentage": ... }, ... ],
        "totalProducts": ...
      }
    }
    ```

#### 3. Get Top Selling Products

*   **Method:** `GET`
*   **URL:** `/admin/products/top-selling`
*   **Description:** Retrieves the top N best-selling products based on `sold` count.
*   **Auth:** Admin Only
*   **Query Parameters:** `limit` (default: 10).
*   **Success Response (200 OK):** Returns list of product objects.

#### 4. Get Recent Orders

*   **Method:** `GET`
*   **URL:** `/admin/orders/recent`
*   **Description:** Retrieves the most recent N orders.
*   **Auth:** Admin Only
*   **Query Parameters:** `limit` (default: 10).
*   **Success Response (200 OK):** Returns list of order objects with populated user data (`user.name`, `user.email`).

#### 5. Get Categories with Subcategories

*   **Method:** `GET`
*   **URL:** `/admin/categories/with-subcategories`
*   **Description:** Retrieves categories with their subcategory counts.
*   **Auth:** Admin Only
*   **Success Response (200 OK):** Returns list of categories with `subcategoryCount`.

#### 6. Get Revenue Timeline

*   **Method:** `GET`
*   **URL:** `/admin/revenue/timeline`
*   **Description:** Retrieves revenue data aggregated over time for charting.
*   **Auth:** Admin Only
*   **Query Parameters:** `period` (`daily` [last 30d], `weekly` [last 12w], `monthly` [last 12m] - default: `monthly`).
*   **Success Response (200 OK):**
    ```json
    {
      "status": "success",
      "data": {
        "period": "monthly", // or daily, weekly
        "timeline": [ { "period": "Jan 2024", "revenue": ..., "orders": ... }, ... ] // Format varies by period
      }
    }
    ```

---

## Internal/System Endpoints

*   `/webhook-checkout`: Handles Stripe webhook events. Not called by frontend.
*   `/checkout-result`: Target for Stripe redirects, then redirects browser to frontend. Not called by frontend. 