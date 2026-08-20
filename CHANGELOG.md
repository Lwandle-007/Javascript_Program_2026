<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learner Support Portal</title>
  <style>
    /* Reset some default styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background: #f4f4f4;
      color: #333;
    }

    /* Navigation Bar */
    nav {
      background: #555e66;
      color: #fff;
      padding: 1rem;
    }

    nav ul {
      list-style: none;
      display: flex;
      justify-content: flex-end;
    }

    nav ul li {
      margin-left: 20px;
    }

    nav ul li a {
      color: #fff;
      text-decoration: none;
      font-weight: bold;
      transition: color 0.3s ease;
    }

    nav ul li a:hover {
      color: #e1b0f5;
    }

    /* Welcome Section */
    .welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 90vh;
      text-align: center;
      background: linear-gradient(to right, #7e8e9e, #477cb1);
      color: #fff;
      padding: 2rem;
    }

    .welcome h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .welcome p {
      font-size: 1.2rem;
      max-width: 600px;
      margin-bottom: 2rem;
    }

    .welcome button {
      background: #e29df0;
      border: none;
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      border-radius: 5px;
      transition: background 0.3s ease;
    }

    .welcome button:hover {
      background: #e8cff0;
    }
  </style>
</head>
<body>

  <!-- Navigation Bar -->
  <nav>
    <a href="#" class="logo">Learner Support Portal</a>
    <span class="menu-toggles">&#9776;</span>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#features">Features</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>

  <!-- Welcome Section -->
  <section class="welcome" id="home">
    <h1>Welcome to the Learner Support Portal</h1>
    <p>You don't have to learn alone. Get the support you need to succeed.</p>
    <button>Get Started</button>
  </section>

  <script>
    //Toggle mobile menu
    const menuToggles =document.querySelector('.menu-toggles');
    const navLinks =document.querySelector('nav ul');

    menuToggles.addEventListener('click', ()=>{
      navLinks.classList.toggle('showing');
    });
  </script>

</body>
</html>
 
