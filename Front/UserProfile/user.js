export class user{
    constructor(Name, LastName, Phone, UserName, Password, Email, ProfilePicture, Interests, NumberOfFriends, Status, Horoscope)
    {
        this.Name = Name;
        this.LastName = LastName;
        this.Phone = Phone;
        this.UserName = UserName;
        this.Password = Password;
        this.Email = Email;
        this.ProfilePicture = ProfilePicture;
        this.Interests = Interests;
        this.NumberOfFriends = NumberOfFriends;
        this.Status = Status;
        this.Horoscope = Horoscope;
    }

    decodeJwtFromLocalStorage() {
       
        const jwtToken = localStorage.getItem("accessToken");
      
        if (!jwtToken) {
          console.error("JWT token not found in local storage");
          return null;
        }
      
        
        const [header, payload, signature] = jwtToken.split('.');
      
        
        const decodedHeader = JSON.parse(atob(header));
        const decodedPayload = JSON.parse(atob(payload));
      
        var subClaim = decodedPayload.sub;
 
        return subClaim;
       
        
      }
      
      prikazPodataka(ime){
         var username = this.decodeJwtFromLocalStorage();

         console.log(username);

         fetch(`http://localhost:5142/User/getUserByUsername/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if needed
                },
                })
                .then(response => {
                    if (!response.ok) {
                    throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    ime = document.getElementById("ime");
                    ime.innerText = data.name + " " + data.lastName; 
                    var interesovanja = document.getElementById("interesovanja");
                    if (data.Interests != undefined)
                    {
                        interesovanja.innerText = data.Interests;
                       
                    }
                    var Horoscope = document.getElementById("horoskop");
                    if(data.Horoscope != undefined)
                    {
                        Horoscope.innerText = data.Horoscope;
                        console.log('User data:', data);
                    }
                })
                .catch(error => {
                    console.error('Error while fetching user data:', error);
                });

      }
      
 


}