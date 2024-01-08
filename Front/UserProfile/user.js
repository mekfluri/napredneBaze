import { Decode } from "../decode.js";

export class User {
    constructor(id, Name, LastName, Phone, UserName, Password, Email, ProfilePicture, Interests, NumberOfFriends, Status, Horoscope) {
        this.id = id
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
        this.searchButton = document.getElementById("filtriranje");
        this.editButton = document.getElementById("editProfile");
        this.zahteviButton = document.getElementById("editZahtevi");
        this.edit = document.getElementById("edit");
        this.searchInput = document.getElementById("searchInput");
        this.editPhoto = document.getElementById("editPhoto");
        this.trenutniID = null;
        this.ime = document.getElementById("ime"); // Dodao sam this.ime
        this.searchButton.addEventListener("click", () => {
            console.log("Kliknuto!");
            this.pretraga();
        });
        this.editButton.addEventListener("click", () => {
          
            this.editProfile();
        });
          this.zahteviButton.addEventListener("click", () => {
          
            this.lookZahtevi();
        });
        this.edit.addEventListener("click", () => {
          
            this.editandSave();
        });
        this.editPhoto.addEventListener("click", () => {
          
            this.editPhoto1();
        });

        
    }

    prikazPodataka() {
        var decode = new Decode();
        var username = decode.decodeJwtFromLocalStorage();

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
                console.log(data);
                this.id = data.id;
                this.Phone = data.phone;
                this.UserName = data.userName;
                this.LastName = data.lastName;
                this.ime.innerText = data.name + " " + data.lastName; // Ispravio sam document.getElementById("ime") na this.ime
                var interesovanja = document.getElementById("interesovanja");
                console.log(data.interests)
                if (data.interests != undefined) {
                    this.interesovanja = data.interests;
                    interesovanja.innerText = "Interesovanja:" + " " +data.interests;
                }
                var Horoscope = document.getElementById("horoskop");
                if (data.horoscope != undefined) {
                    this.horoscope = data.horoscope;
                    Horoscope.innerText = "Horoskop:"+" "+data.horoscope;
                    console.log('User data:', data);
                }
                var email = document.getElementById("email");
                if (data.email != undefined) {
                    this.email = data.email;
                    email.innerText = "Email:"+" "+data.email;
                    console.log('User data:', data);
                }
              
                var username = document.getElementById("username");
                
                if (data.userName != undefined) {
                    
                    username.innerText = data.userName;
                  
                }

             })
            .catch(error => {
                console.error('Error while fetching user data:', error);
            });


     
    }

    pretraga() {
        console.log("pritisnula sam");
        var searchInput = document.getElementById("searchInput");
        var searchValue =  searchInput.value;
        localStorage.setItem('searchValue', searchValue);
        console.log(searchValue);

        window.location.href =  window.location.href = location.origin + '/Front/DrugiKorisnici/profile1.html';


    }

    editProfile(){
       
            var mojDiv = document.getElementById("mojDiv");
            mojDiv.style.display = (mojDiv.style.display === "none" || mojDiv.style.display === "") ? "flex" : "none";

            
       
        
    }
      lookZahtevi() {
        var mojDiv = document.getElementById("divZahtevi");
        mojDiv.style.display = (mojDiv.style.display === "none" || mojDiv.style.display === "") ? "flex" : "none";
        var zahteviDiv = document.getElementById("Zahtevi");

        this.fetchFriendRequests(); // Call the fetchFriendRequests method using this

        console.log("tusam");
    }

    fetchFriendRequests() {
        fetch(`http://localhost:5142/User/getUserCurrent`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.id);
            this.trenutniID = data.id;
            fetch(`http://localhost:5142/User/getFriendRequests/${data.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(zahteviArray => {
                console.log(zahteviArray);
              
                this.createZahteviDivs(zahteviArray,   document.getElementById("zahteviDiv"));
            })
            .catch(error => {
                console.error('Error while fetching friend requests:', error);
            });
        })
        .catch(error => {
            console.error('Error while fetching user data:', error);
        });
    }

    createZahteviDivs(zahteviArray) {
        var zahteviDiv = document.getElementById("Zahtevi");
        zahteviDiv.innerHTML = '';

        zahteviArray.forEach(zahtev => {
            console.log(zahtev);
            var newDiv = document.createElement("div");
            newDiv.className = "zahtev-div";
            newDiv.innerHTML = '<p>' + zahtev.userName + '</p><button class="prihvati-button" data-zahtev-id="' + zahtev.id + '">Prihvati</button>';
            zahteviDiv.appendChild(newDiv);
        });

        zahteviDiv.addEventListener("click", (event) => {
            if (event.target.classList.contains("prihvati-button")) {
                var zahtevId = event.target.dataset.zahtevId;
                this.handleButtonClick(zahtevId);
            }
        });
    }

    handleButtonClick(zahtevId) {
        console.log(this.trenutniID);

        fetch(`http://localhost:5142/User/acceptFriend/${zahtevId}/${this.trenutniID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            this.refreshZahteviDiv();
        })
        .catch(error => {
            console.error('Error while accepting friend request:', error);
        });
    }

    refreshZahteviDiv() {
        this.fetchFriendRequests();
    }


    
    editandSave(){
        var ime = document.getElementById("polje1").value;
        var prezime = document.getElementById("polje2").value;
        var username = document.getElementById("polje3").value;
        var horoskop = document.getElementById("polje4").value;
        var interesovanja = document.getElementById("polje5").value;
        var email = document.getElementById("polje6").value;

        if (ime === "") {
            ime = this.Name;
        }
      
        
        
        if (prezime === "") {
            prezime = this.LastName;
        }
        
        if (username === "") {
           username = this.UserName;
        }
        
        if (horoskop === "") {
           horoskop = this.horoscope;
        }
        
        if (interesovanja === "") {
           interesovanja = this.interesovanja;
        }
        
        if (email === "") {
            email = this.email;
        }
       

        const editData = {
            Id: this.id, // Zamijenite sa stvarnim ID-om koji želite ažurirati
            Name: ime,
            LastName: prezime,
            UserName: username,
            Phone: this.Phone,
            Email: email,
            Interests: interesovanja,
            Horoscope: horoskop,
          };
          console.log(editData);

          fetch('http://localhost:5142/User/IzmeniKorisnika', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(editData),
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(data => {
              console.log('Uspješno ažurirano:', data);
              this.prikazPodataka();
              // Osvježite korisnički interfejs ili izvršite druge akcije koje su vam potrebne nakon ažuriranja
            })
            .catch(error => {
              console.error('Greška pri ažuriranju:', error);
            });
          

           
        

    }
     editPhoto1()
     {
         var mojfile = document.getElementById("uploadInput");
            mojfile.style.display = (mojfile.style.display === "none" || mojfile.style.display === "") ? "block" : "none";

     }

}
