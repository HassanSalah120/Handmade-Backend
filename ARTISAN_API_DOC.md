# Handmade Platform API Documentation (Artisan Endpoints - v1)

This document provides details about the API endpoints relevant for an **Artisan** user of the Handmade Platform, intended for use by the Flutter frontend development team. Artisans have all the capabilities of a standard User, plus additional permissions for managing products, their orders, and potentially store-level configurations like coupons.

**Base URL:** `/api/v1`

**Authentication:** Most endpoints require a JSON Web Token (JWT) with Artisan (or Admin) privileges, sent in the `Authorization` header:
`Authorization: Bearer <your_jwt_token>`

---

## User Endpoints (Also Available to Artisans)

Artisans can use all endpoints documented in `USER_API_DOC.md`, including:

*   Authentication (Sign Up - *role defaults to 'user', admin may need to change to 'artisan'*, Login, Forgot/Reset Password)
*   User Profile Management (Get/Update Profile, Update Password, Deactivate Account)
*   Browsing (Products, Categories, Subcategories - Public GET endpoints)
*   Reviews (Get All for a Product, Get Specific, Create Own, Update Own, Delete Own)
*   Wishlist Management
*   Address Management
*   Shopping Cart Management
*   Placing Orders (Cash or Stripe)
*   Viewing Own Orders (as a customer)

---

## Artisan-Specific Management

### Products (`/products`)

Artisans can manage their own products. 
**Important Note on Product Ownership:** Currently, the `PATCH` and `DELETE` product endpoints authorize based on the "Artisan" role but do **not** strictly verify that the product being modified or deleted belongs to the authenticated artisan. This is a known limitation.

*   **Create Product:**
    *   **Method:** `POST`
    *   **URL:** `/products`
    *   **Auth:** Required (Artisan or Admin)
    *   **Request Type:** `multipart/form-data` (if `imageCover` or `images` are included)
    *   **Request Body Fields (form-data):**
        *   `title` (String, required)
        *   `description` (String, required)
        *   `price` (Number, required)
        *   `quantity` (Number, required)
        *   `category` (String - Category ID, required)
        *   `subCategories` (Array of Strings - SubCategory IDs, e.g., `subCategories[0]=id1&subCategories[1]=id2` or pass as JSON string if backend handles parsing)
        *   `brand` (String - Brand ID)
        *   `colors` (Array of Strings - e.g., `colors[0]=Red&colors[1]=Blue` or pass as JSON string)
        *   `materials` (Array of Strings - e.g., `materials[0]=Cotton&materials[1]=Wool` or pass as JSON string)
        *   `imageCover` (File - max 1, optional)
        *   `images` (Array of Files - max 5, optional)
        *   `priceAfterDiscount` (Number, optional)
        *   *(Other fields as per Product model)*
    *   **Example Form-Data (Conceptual - actual structure depends on client library):**
        ```
        title: "Handcrafted Vase",
        description: "Beautiful ceramic vase, hand-painted.",
        price: 2500, // Assuming price in smallest currency unit (e.g., piastres/cents)
        quantity: 10,
        category: "60d5f1234567890123456789",
        subCategories[0]: "60d5f123456789012345678a",
        colors[0]: "Blue",
        imageCover: (binary file data for imageCover.jpg)
        images[0]: (binary file data for image1.jpg)
        images[1]: (binary file data for image2.jpg)
        ```
    *   **Success Response (201 Created):**
        *   **Content-Type:** `application/json`
        *   **Body:** The newly created product object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f234567890123456789c",
                    "title": "Handcrafted Vase",
                    "description": "Beautiful ceramic vase, hand-painted.",
                    "price": 2500,
                    "quantity": 10,
                    "category": "60d5f1234567890123456789",
                    "subCategories": ["60d5f123456789012345678a"],
                    "colors": ["Blue"],
                    "imageCover": "product-....-cover.jpeg",
                    "images": ["product-....-1.jpeg", "product-....-2.jpeg"],
                    // ... other product fields including timestamps ...
                }
            }
            ```
    *   **Errors:** 400 (Validation errors), 401/403 (Auth errors).

*   **Update Product (Text Fields Only):**
    *   **Method:** `PATCH`
    *   **URL:** `/products/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Product ID)
    *   **Request Type:** `application/json`
    *   **Example Request Body (JSON):**
        ```json
        {
            "title": "Updated Handcrafted Vase",
            "price": 2800,
            "quantity": 8
        }
        ```
    *   **Note:** This endpoint does NOT handle image updates.
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:** The updated product object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f234567890123456789c",
                    "title": "Updated Handcrafted Vase",
                    "price": 2800,
                    "quantity": 8,
                    // ... other product fields ...
                }
            }
            ```
    *   **Errors:** 404 (Product not found), 400 (Validation errors), 401/403 (Auth errors).

*   **Update Product Images:**
    *   **Note:** A dedicated endpoint for updating `imageCover` or `images` of an existing product is **not currently implemented**. This would require a separate `PUT` or `POST` endpoint that accepts `multipart/form-data`.

*   **Delete Product:**
    *   **Method:** `DELETE`
    *   **URL:** `/products/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Product ID)
    *   **Success Response (204 No Content):** No body.
    *   **Errors:** 404 (Product not found), 401/403 (Auth errors).

*   **Get All Products (Public):**
    *   **Method:** `GET`
    *   **URL:** `/products` (supports pagination, filtering, sorting)
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:**
            ```json
            {
                "status": "Success",
                "results": 20, // Total number of products matching query (for this page)
                "paginationResult": {
                    "currentPage": 1,
                    "limit": 10,
                    "numberOfPages": 2,
                    "next": 2
                },
                "data": [
                    { /* Product Object 1 */ },
                    { /* Product Object 2 */ },
                    // ... up to 'limit' products ...
                ]
            }
            ```

*   **Get Single Product (Public):**
    *   **Method:** `GET`
    *   **URL:** `/products/:id`
    *   **Path Parameter:** `:id` (Product ID)
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:**
            ```json
            {
                "status": "Success",
                "data": { /* Full Product Object, potentially populated with reviews */ }
            }
            ```
    *   **Errors:** 404 (Product not found).

### Categories (`/categories`)

While Admins have broader category management, Artisans might need to select categories or, in some systems, contribute to them. Current permissions allow Artisan CRUD:

*   **Create Category:**
    *   **Method:** `POST`
    *   **URL:** `/categories`
    *   **Auth:** Required (Artisan or Admin)
    *   **Request Type:** `application/json`
    *   **Example Request Body (JSON):**
        ```json
        {
            "name": "Handmade Pottery"
        }
        ```
    *   **Note:** The Category model does not directly handle image file uploads. If an image is associated, it's likely via an image URL string field (e.g., `"image": "http://example.com/image.jpg"`) sent as part of the JSON body. The current backend routes for categories do not process direct file uploads.
    *   **Success Response (201 Created):**
        *   **Content-Type:** `application/json`
        *   **Body:** The new category object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f123abcdeffedcba9876",
                    "name": "Handmade Pottery",
                    "slug": "handmade-pottery",
                    // "image": "http://example.com/image.jpg", // If image URL was provided
                    "createdAt": "2023-01-01T12:00:00.000Z",
                    "updatedAt": "2023-01-01T12:00:00.000Z"
                }
            }
            ```
    *   **Errors:** 400 (Validation errors), 401/403 (Auth errors).

*   **Update Category:**
    *   **Method:** `PATCH`
    *   **URL:** `/categories/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Category ID)
    *   **Request Type:** `application/json`
    *   **Example Request Body (JSON):**
        ```json
        {
            "name": "Artisanal Ceramics"
        }
        ```
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:** The updated category object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f123abcdeffedcba9876",
                    "name": "Artisanal Ceramics",
                    "slug": "artisanal-ceramics",
                    "updatedAt": "2023-01-02T10:00:00.000Z"
                    // ... other fields ...
                }
            }
            ```
    *   **Errors:** 404 (Category not found), 400 (Validation errors), 401/403 (Auth errors).

*   **Delete Category:**
    *   **Method:** `DELETE`
    *   **URL:** `/categories/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Category ID)
    *   **Success Response (204 No Content):** No body.
    *   **Errors:** 404 (Category not found), 401/403 (Auth errors).

*   **Get All Categories (Public):**
    *   **Method:** `GET`
    *   **URL:** `/categories`
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:**
            ```json
            {
                "status": "Success",
                "results": 15, // Total number of categories
                "paginationResult": { /* ... pagination details ... */ },
                "data": [
                    { /* Category Object 1 */ },
                    { /* Category Object 2 */ }
                ]
            }
            ```

*   **Get Single Category (Public):**
    *   **Method:** `GET`
    *   **URL:** `/categories/:id`
    *   **Path Parameter:** `:id` (Category ID)
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:**
            ```json
            {
                "status": "Success",
                "data": { /* Full Category Object */ }
            }
            ```
    *   **Errors:** 404 (Category not found).

### Subcategories (`/subcategories`)

Similar to Categories, Artisans currently have CRUD permissions:

*   **Create Subcategory:**
    *   **Method:** `POST`
    *   **URL:** Can be `/subcategories` (parent `category` ID in body) OR `/categories/:categoryId/subcategories` (parent `category` ID from URL).
    *   **Auth:** Required (Artisan or Admin)
    *   **Request Type:** `application/json`
    *   **Example Request Body (JSON for POST /subcategories):**
        ```json
        {
            "name": "Decorative Vases",
            "category": "60d5f123abcdeffedcba9876" // Parent Category ID
        }
        ```
    *   **Success Response (201 Created):**
        *   **Content-Type:** `application/json`
        *   **Body:** The new subcategory object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f345abcdef0123456789",
                    "name": "Decorative Vases",
                    "slug": "decorative-vases",
                    "category": "60d5f123abcdeffedcba9876",
                    "createdAt": "2023-01-03T11:00:00.000Z",
                    "updatedAt": "2023-01-03T11:00:00.000Z"
                }
            }
            ```
    *   **Errors:** 400 (Validation errors, Invalid parent category ID), 401/403 (Auth errors).

*   **Update Subcategory:**
    *   **Method:** `PATCH`
    *   **URL:** `/subcategories/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Subcategory ID)
    *   **Request Type:** `application/json`
    *   **Example Request Body (JSON):**
        ```json
        {
            "name": "Hand-Painted Vases"
        }
        ```
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:** The updated subcategory object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f345abcdef0123456789",
                    "name": "Hand-Painted Vases",
                    "slug": "hand-painted-vases",
                    // ... other fields ...
                }
            }
            ```
    *   **Errors:** 404 (Subcategory not found), 400 (Validation errors), 401/403 (Auth errors).

*   **Delete Subcategory:**
    *   **Method:** `DELETE`
    *   **URL:** `/subcategories/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Subcategory ID)
    *   **Success Response (204 No Content):** No body.
    *   **Errors:** 404 (Subcategory not found), 401/403 (Auth errors).

*   **Get All Subcategories (Public):**
    *   **Method:** `GET`
    *   **URL:** `/subcategories` (can be filtered by parent, e.g., `/categories/:categoryId/subcategories`)
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:** (Similar structure to Get All Categories, but with subcategory objects)
            ```json
            {
                "status": "Success",
                "results": 10,
                "paginationResult": { /* ... pagination details ... */ },
                "data": [
                    { /* Subcategory Object 1 */ },
                    { /* Subcategory Object 2 */ }
                ]
            }
            ```

*   **Get Single Subcategory (Public):**
    *   **Method:** `GET`
    *   **URL:** `/subcategories/:id`
    *   **Path Parameter:** `:id` (Subcategory ID)
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:**
            ```json
            {
                "status": "Success",
                "data": { /* Full Subcategory Object */ }
            }
            ```
    *   **Errors:** 404 (Subcategory not found).

### Coupons (`/coupons`)

Artisans can manage their own discount coupons.

*   **Create Coupon:**
    *   **Method:** `POST`
    *   **URL:** `/coupons`
    *   **Auth:** Required (Artisan or Admin)
    *   **Request Type:** `application/json`
    *   **Example Request Body (JSON):**
        ```json
        {
            "name": "WINTERSALE20", 
            "expire": "2024-12-31",
            "discount": 20 
        }
        ```
        *   Note: `name` should be unique.
    *   **Success Response (201 Created):**
        *   **Content-Type:** `application/json`
        *   **Body:** The new coupon object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f456efghij1234567890",
                    "name": "WINTERSALE20",
                    "expire": "2024-12-31T00:00:00.000Z",
                    "discount": 20,
                    "createdAt": "2023-01-04T10:00:00.000Z",
                    "updatedAt": "2023-01-04T10:00:00.000Z"
                }
            }
            ```
    *   **Errors:** 400 (Validation errors - e.g., name not unique, invalid date, discount out of range), 401/403 (Auth errors).

*   **Get All Coupons (for the Artisan/Admin):**
    *   **Method:** `GET`
    *   **URL:** `/coupons`
    *   **Auth:** Required (Artisan or Admin)
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:**
            ```json
            {
                "status": "Success",
                "results": 5,
                "paginationResult": { /* ... pagination details ... */ },
                "data": [
                    { /* Coupon Object 1 */ },
                    { /* Coupon Object 2 */ }
                ]
            }
            ```
        *   **Note:** This likely returns all coupons accessible to the role, not just those created by a specific artisan unless further logic is added.

*   **Get Single Coupon:**
    *   **Method:** `GET`
    *   **URL:** `/coupons/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Coupon ID)
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:**
            ```json
            {
                "status": "Success",
                "data": { /* Full Coupon Object */ }
            }
            ```
    *   **Errors:** 404 (Coupon not found).

*   **Update Coupon:**
    *   **Method:** `PATCH`
    *   **URL:** `/coupons/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Coupon ID)
    *   **Request Type:** `application/json`
    *   **Example Request Body (JSON):**
        ```json
        {
            "expire": "2025-01-31",
            "discount": 22
        }
        ```
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:** The updated coupon object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f456efghij1234567890",
                    "name": "WINTERSALE20", 
                    "expire": "2025-01-31T00:00:00.000Z",
                    "discount": 22,
                    // ... other fields ...
                }
            }
            ```
    *   **Errors:** 404 (Coupon not found), 400 (Validation errors), 401/403 (Auth errors).

*   **Delete Coupon:**
    *   **Method:** `DELETE`
    *   **URL:** `/coupons/:id`
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Coupon ID)
    *   **Success Response (204 No Content):** No body.
    *   **Errors:** 404 (Coupon not found), 401/403 (Auth errors).

### Order Management (`/orders`)

Artisans primarily view and update the status of orders containing their products.

*   **Mark Order as Paid:**
    *   **Method:** `PUT`
    *   **URL:** `/orders/:id/pay`
    *   **Description:** Marks an order as paid (e.g., if admin/artisan confirms offline payment for a COD order).
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Order ID)
    *   **Request Body:** None.
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:** The updated order object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f567ghijkl1234567890",
                    "isPaid": true,
                    "paidAt": "2023-01-05T14:30:00.000Z",
                    // ... other order fields ...
                }
            }
            ```
    *   **Errors:** 404 (Order not found), 401/403 (Auth errors).

*   **Mark Order as Delivered:**
    *   **Method:** `PUT`
    *   **URL:** `/orders/:id/deliver`
    *   **Description:** Marks an order as delivered.
    *   **Auth:** Required (Artisan or Admin)
    *   **Path Parameter:** `:id` (Order ID)
    *   **Request Body:** None.
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:** The updated order object.
            ```json
            {
                "status": "Success",
                "data": {
                    "_id": "60d5f567ghijkl1234567890",
                    "isDelivered": true,
                    "deliveredAt": "2023-01-06T10:15:00.000Z",
                    // ... other order fields ...
                }
            }
            ```
    *   **Errors:** 404 (Order not found), 401/403 (Auth errors).

*   **Get All Orders (Filtered for Admin/Artisan):** 
    *   **Method:** `GET`
    *   **URL:** `/orders`
    *   **Auth:** Required (Artisan or Admin)
    *   **Description:** Retrieves a list of orders. 
        *   **Note for Artisans:** Currently, the backend returns ALL orders for users with "Artisan" or "Admin" roles. It does **not** automatically filter orders to show only those containing the specific artisan's products. The frontend might need to implement client-side filtering if this specific view is required, or the backend could be enhanced with a query parameter for this.
    *   **Query Parameters:** Standard pagination (`limit`, `page`), sorting, etc.
    *   **Success Response (200 OK):**
        *   **Content-Type:** `application/json`
        *   **Body:**
            ```json
            {
                "status": "Success",
                "results": 12, // Total orders for this page
                "paginationResult": { /* ... pagination details ... */ },
                "data": [
                    { /* Order Object 1, potentially populated with user/cartItems */ },
                    { /* Order Object 2 */ }
                ]
            }
            ```
    *   **Errors:** 401/403 (Auth errors). 