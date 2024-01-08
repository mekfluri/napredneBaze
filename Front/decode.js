export class Decode{
    constructor(user){
        this.user = user;
    }
    decodeJwtFromLocalStorage(){
       
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


      vratiKorisnika() {
        var username = this.decodeJwtFromLocalStorage();

        return fetch(`http://localhost:5142/User/getUserByUsername/${username}`, {
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
            console.log(data);
            this.user = data;
            return this.user;
        })
        .catch(error => {
            console.error('Error while fetching user data:', error);
        });
    }


    

}




