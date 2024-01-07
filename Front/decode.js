export class Decode{
    constructor(){
        
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
}



