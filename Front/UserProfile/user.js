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
        this.dodajStory = document.getElementById("dodajStory");
        this.editPhoto = document.getElementById("editPhoto");
        this.editPhotoo = document.getElementById("editPhoto1");
        this.azuriraj = document.getElementById("editPhoto2");


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
        this.editPhotoo.addEventListener("click", () => {
          
            this.saveImageToNeo4j();
        });
        this.dodajStory.addEventListener("click", () => {
          
            this.dodajNoviStory();
        });
        this.azuriraj.addEventListener("click", () => {
          
            this.prikazSlike();
        });

        

        
    }

    prikazPodataka() {
        var decode = new Decode();
        var username = decode.decodeJwtFromLocalStorage();
        this.dodaj();

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
                localStorage.setItem('searchValue', data.userName);
                console.log(data);
                this.ProfilePicture = data.profilePicture;
                this.displayImage(this.ProfilePicture);
                this.id = data.id;
                this.Phone = data.phone;
                this.Name = data.name;
                this.UserName = data.userName;
                this.LastName = data.lastName;
                this.ime.innerText = data.name + " " + data.lastName; // Ispravio sam document.getElementById("ime") na this.ime
                var interesovanja = document.getElementById("interesovanja");
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

                var brojPrijatelja = document.getElementById("brojPrijatelja");
                console.log(data.numbersOfFriends);
                brojPrijatelja.innerText = "Broj prijatelja:" + " "+ data.numbersOfFriends;
                console.log('User data:', data);
              
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

        if(searchValue == this.UserName)
        {
             alert("Ne mozete pretrazivati sebe.") 
        }else
        {
            localStorage.setItem('searchValue', searchValue);
            console.log(searchValue);
    
            window.location.href =  window.location.href = location.origin + '/Front/DrugiKorisnici/profile1.html';
        }
       


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

    async fetchFriendRequests() {


            var decode = new Decode();
            var korisnik = await decode.vratiKorisnika();
            console.log(korisnik);
            this.trenutniID = korisnik.id;
            console.log(this.trenutniID);
            fetch(`http://localhost:5142/User/getFriendRequests/${this.trenutniID}`, {
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
        
    }

    createZahteviDivs(zahteviArray) {
        var zahteviDiv = document.getElementById("Zahtevi");
        zahteviDiv.innerHTML = '';

        zahteviArray.forEach(zahtev => {
            console.log(zahtev);
            var newDiv = document.createElement("div");
            newDiv.className = "zahtev-div";
            newDiv.innerHTML = '<p>' + zahtev.userName + '</p><button id="prihvati" class="prihvati-button" data-zahtev-id="' + zahtev.id + '">Prihvati</button>';
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
        console.log(zahtevId);
    
        fetch(`http://localhost:5142/User/acceptFriend/${zahtevId}/${this.trenutniID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
            
            return response.json();
        })
        .then(data => {
            console.log(data);
            this.refreshZahteviDiv();
        })
        .catch(error => {
            console.error('Error while accepting friend request:', error);
        });
    }
    

    refreshZahteviDiv() {
        this.fetchFriendRequests();
        location.reload();
    }


    
    async editandSave(){
        var ime = document.getElementById("polje1").value;
        var prezime = document.getElementById("polje2").value;
        var username = "";
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

          await fetch('http://localhost:5142/User/IzmeniKorisnika', {
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
          
            })
            .catch(error => {
              console.error('Greška pri ažuriranju:', error);
            });
          

            location.reload();
        

    }
    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    displayImage(putanja) {
     
        var imgElement = document.getElementById('profileImage');
       
        imgElement.src = putanja;
    }
    
    async editPhoto1() {
        var input = document.getElementById('uploadInput');
        input.style.display = "block";
        //input.style.display = (input.style.display === "none" || input.style.display === "") ? "block" : "none";
        var file = input.files[0];
       
        
        if (file) {
            console.log(file.name)
            localStorage.setItem('ime', file.name);
            var formData = new FormData();
            formData.append('file', file);
            console.log(file);
            console.log(formData)
            await fetch('http://localhost:5142/User/upload', {
                method: 'POST',
                body: formData,
               
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
               localStorage.setItem('slika', data.message);
               this.ProfilePicture = data.message;
              
               alert(data.message);
               
             
             
             
            })
            .catch(error => {
                console.error('Error:', error);
            });

          
                } else {
            alert('Molimo odaberite sliku za upload.');
        
            //this.saveImageToNeo4j(putanja);
        
        }


        
    }
    

   
    saveImageToNeo4j(imageBytes)
    {
        
        var ime = localStorage.getItem('ime');
        var slika = "../../" + ime;
        console.log(slika);
        console.log(this.id)
        var encodedSlikaPath = encodeURIComponent(slika);
        
        this.displayImage(slika);

        fetch(`http://localhost:5142/User/azurirajSliku/${this.id}/${encodedSlikaPath}`, {
            method: 'PUT',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}, Text: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
           //this.displayImage(encodedSlikaPath);
        })
        .catch(error => {
            console.error('Greška prilikom ažuriranja slike:', error);
        });

    }

    prikazSlike(){
        var input = document.getElementById('uploadInput');
        
        input.style.display = (input.style.display === "none" || input.style.display === "") ? "flex" : "none";
        var dugme = document.getElementById('editPhoto');
        
        dugme.style.display = (dugme.style.display === "none" || dugme.style.display === "") ? "flex" : "none";
        var dugme1 = document.getElementById('editPhoto1');
        
        dugme1.style.display = (dugme1.style.display === "none" || dugme1.style.display === "") ? "flex" : "none";

    }

    async dodaj()
    {
        var decode = new Decode();
        var korisnik = await decode.vratiKorisnika();
        var userid = korisnik.id;
        console.log(userid);
        var contentDiv = document.getElementById("dodaj");
        const storyIframe = document.createElement('iframe');
        console.log(this.id);
        storyIframe.src = `../Highlights/highlight.html?dataId=${userid}`;  //odje menjas
        storyIframe.style.width = '100%';
        storyIframe.style.height = '900px'; // Set the height as needed

              

        //contentDiv.appendChild(heading);
        //contentDiv.appendChild(description);
        contentDiv.appendChild(storyIframe);
    }
    
    dodajNoviStory(){
        window.location.href =  window.location.href = location.origin + '/Front/makestory.html';
    }


}
