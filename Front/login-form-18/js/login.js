
// Dohvatanje referenci na input elemente
export class login{
  constructor(username, password)
  {
    this.username = username;
    this.password = password;
  }

  prijaviSe()
  {
    var usernameInput = document.getElementById("usernameInput");
    var passwordInput = document.getElementById("passwordInput");
    var button = document.getElementById("getStartedButton");
    
    button.addEventListener("click", function(event) {
        // Prevent default ponašanje forme (da ne bi došlo do submita)
        event.preventDefault();
    
        // Dohvatanje vrednosti iz inputa
        var usernameValue = usernameInput.value;
        var passwordValue = passwordInput.value;
    
        // Rad sa vrednostima (npr. slanje na server ili druga logika)
        console.log("Username:", usernameValue);
        console.log("Password:", passwordValue);
    
        

        const loginData = {
            UserName: usernameValue,
            Password: passwordValue
          };
          console.log(loginData)
          
          fetch('http://localhost:5142/User/Login', {
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
            return response.text();  // <-- Use response.text() instead of response.json()
          })
          .then(data => {
            localStorage.setItem("accessToken", data);
            var token = localStorage.getItem("accessToken");
            window.location.href = location.origin + '/Front/UserProfile/profile.html';
            console.log(data);
          })
          .catch(error => {
            console.error('Error during login:', error);
          });
          

    });
  }


}



