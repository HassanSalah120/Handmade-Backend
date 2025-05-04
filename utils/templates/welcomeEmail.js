// templates/welcomeEmail.js

const welcomeEmailHtml = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to HandMade!</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f9f9f9;
      color: #333;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      max-width: 600px;
      margin: auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      color: #f27a1a;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 20px;
      background-color: #f27a1a;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 30px;
      font-size: 13px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Welcome to HandMade, ${name}! 🎉</h2>
    <p>Thank you for joining the HandMade family. We're thrilled to have you with us!</p>
    <p>Explore unique, handcrafted products created with love by skilled artisans from around the world.</p>

    <a href="https://d605-196-137-122-88.ngrok-free.app/api/v1/products" class="btn">Start Shopping</a>

    <p>If you have any questions, feel free to reply to this email — we're here to help.</p>

    <div class="footer">
      &copy; 2025 HandMade. All rights reserved.<br>
      You're receiving this email because you registered on our platform.
    </div>
  </div>
</body>
</html>
`;

module.exports = welcomeEmailHtml;
