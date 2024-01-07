
// Dohvatanje referenci na input elemente
export class register{
    constructor(username, password, name, lastName, email, phone)
    {
      this.username = username;
      this.password = password;
      this.name = name;
      this.lastName = lastName;
      this.email = email;
      this.phone = phone;
    }
  
    prijaviSe()
    {
      var usernameInput = document.getElementById("usernameInput");
      var passwordInput = document.getElementById("passwordInput");
      var nameInput = document.getElementById("nameid");
      var lastNameInput = document.getElementById("lastnameid");
      var emailInput = document.getElementById("emailid");
      var phoneInput = document.getElementById("phoneid")
      var button = document.getElementById("getStartedButton");
      
      button.addEventListener("click", function(event) {
     
          event.preventDefault();
      
        
          var usernameValue = usernameInput.value;
          var passwordValue = passwordInput.value;
          var nameValue = nameInput.value;
          var lastNameValue = lastNameInput.value;
          var emailValue = emailInput.value;
          var phoneValue = phoneInput.value;

          console.log("Username:", usernameValue);
          console.log("Password:", passwordValue);
      
          
  
          const loginData = {
              Name: nameValue,
              LastName: lastNameValue,
              UserName: usernameValue,
              Password: passwordValue,
              Phone: phoneValue,
              Email: emailValue 

            };
            
            fetch('http://localhost:5142/User/Register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(loginData)
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then(data => {
                window.location.href = location.origin + 'Front/login-form-18/login.html';
              })
              .catch(error => {
                
                console.error('Ne postoji korisnik');
              });
            
  
      });
    }
  
  
  }
  
  
  
  