import { Decode } from "http://127.0.0.1:5501/Front/decode.js";

document.addEventListener('DOMContentLoaded', async () => {
    try {
      
         const urlParams = new URLSearchParams(window.location.search);
        var highlightId = urlParams.get('dataId');

        const response = await fetch(`http://localhost:5142/Story/getAllStories/${highlightId}`);
        const storiesData = await response.json();
    
        const storiesContainer = document.getElementById('storiesContainer');

        storiesData.forEach(async (s, index) => {
            s.forEach(async(story, index) => {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col-lg-6');

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', 'mb-4');

            const cardBodyDiv = document.createElement('div');
            cardBodyDiv.classList.add('card-body');
            cardBodyDiv.id= story.id;
            
           

                       
             const buttonDelete = document.createElement('button');
            buttonDelete.classList.add('button');
            buttonDelete.textContent = "Obrisi story";
     
            
                  buttonDelete.onclick = async () => {
                      try {
                            const url = `http://localhost:5142/Story/deleteStory/${story.id}`;
                          console.log(story.id);
                         
                            await fetch(url, { method: 'DELETE' });
                         } catch (error) {
                            console.error("Error:", error.message);
                        }

                        location.reload();
                };

          

                



                const buttonEdit = document.createElement('button');
                buttonEdit.classList.add('button');
                buttonEdit.textContent = "Edit Story";

                const buttonHigh=document.createElement("button");
                buttonHigh.classList.add("button");
                buttonHigh.textContent="Dodaj u HighLight";

                //button.onclick
                var fleg = true;
                buttonHigh.onclick = async () => {
                   
                    if(fleg == true)
                    {
                        ucitaj(cardBodyDiv, story.id);
                        fleg = false;
                    }
             

                };






                buttonEdit.onclick = () => {
    try {
        const editableParagraph = document.getElementById(`paragraph-${story.id}`);

        if (editableParagraph) {
            editableParagraph.contentEditable = true;
            editableParagraph.focus();

            editableParagraph.addEventListener('keydown', async (event) => {
                try {
                    if (event.key === 'Enter') {
                        event.preventDefault();

                        const newText = editableParagraph.textContent;
                        const storyId = story.id;
                        console.log(newText);
                        const updateUrl = `http://localhost:5142/Story/updateStory/${storyId}/${newText}`;

                        const response = await fetch(updateUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ storyId, newText }),
                        });

                        if (response.ok) {
                            console.log("Story updated successfully");
                            location.reload();
                        } else {
                            console.error(`Failed to update story. Status: ${response.status}`);
                        }
                    }
                } catch (error) {
                    console.error("Error updating story:", error.message);
                }
            });
        } else {
            console.error("Editable paragraph not found");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
};

                   

            const mediaDiv = document.createElement('div');
            mediaDiv.classList.add('media', 'mb-3');

            const img = document.createElement('img');
            img.src = story.url;
            img.classList.add('d-block', 'ui-w-40', 'rounded-circle');

            const mediaBodyDiv = document.createElement('div');
            mediaBodyDiv.classList.add('media-body', 'ml-3');

            const creatorDiv = document.createElement('div');
             const response = await fetch(`http://localhost:5142/User/getUserById/${story.creator}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                    },
                    });
            const userData = await response.json();
            creatorDiv.textContent = userData.userName;

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('text-muted', 'small');
            dateDiv.textContent = new Date(story.dateTimeCreated).toLocaleString();

           const p = document.createElement('p');
                p.textContent = story.url;
                p.id = `paragraph-${story.id}`;

             const link = document.createElement('a');
                link.href = `${story.url}`; 
                link.target = '_blank';
                link.classList.add('ui-rect', 'ui-bg-cover');
                link.style.backgroundImage = `url('${story.url}')`;

            const cardFooterDiv = document.createElement('div');
            cardFooterDiv.classList.add('card-footer');

            const likesLink = document.createElement('a');
            likesLink.href = 'javascript:void(0)';
            likesLink.classList.add('d-inline-block', 'text-muted');
            likesLink.addEventListener('click', async () => {
                try {
                 
                    const result = await Like(cardBodyDiv.id);
                    location.reload();
                } catch (error) {
                    console.error(`Error liking story: ${error.message}`);
                }
            });
            const likesStrong = document.createElement('strong');
            likesStrong.textContent = story.numLikes;
         

            const likesSmall = document.createElement('small');
            likesSmall.classList.add('align-middle');
            likesSmall.textContent = ' Likes';

            likesLink.appendChild(likesStrong);
            likesLink.appendChild(likesSmall);
          

            mediaBodyDiv.appendChild(creatorDiv);
            mediaBodyDiv.appendChild(dateDiv);

            mediaDiv.appendChild(img);
            mediaDiv.appendChild(mediaBodyDiv);

            cardBodyDiv.appendChild(mediaDiv);
            cardBodyDiv.appendChild(p);

            cardDiv.appendChild(cardBodyDiv);
            cardDiv.appendChild(cardFooterDiv);


            

            
            var nakomsmoprofilu = provera();

            nakomsmoprofilu.then(
                (result) => {
                 var fleg = result;
                 console.log(fleg);
                 if(fleg == true)
                 {
                    cardFooterDiv.appendChild(buttonDelete);
                    cardFooterDiv.appendChild(buttonHigh);
                    cardFooterDiv.appendChild(buttonEdit);
                 }
                },
                (error) => {
                  console.error(error);
                }
            );
             
            
                cardFooterDiv.appendChild(likesLink);
                
                colDiv.appendChild(cardDiv);
                storiesContainer.appendChild(colDiv);
            });
        });
    } catch (error) {
        console.error(`Error fetching stories: ${error.message}`);
    }
});
async function Like(storyId,  likesLink) {
    try {
        var decode=new Decode();
        var korisnik=await decode.vratiKorisnika();

        const userId = korisnik.id;

        const response = await fetch(`http://localhost:5142/Story/likeStory/${storyId}/${userId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("prvi rezultat:", response);
        if (response == null) {
            response = await fetch(`http://localhost:5142/Story/unlikeStory/${storyId}/${userId}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const result = await response.json();
        likesLink.querySelector('strong').textContent = result.newNumLikes;

       
        return cardBodyDivId;
       
    } catch (error) {
        console.error(`Error liking story: ${error.message}`);
        return null;
    }
}

async function ucitaj(cardBodyDiv, storyId) {
   
    try {

        
        

        const highlights = await getHighlightsByUserId();
        
        const divUokviri = document.createElement('div');
        divUokviri.classList.add('divIzaberi');
        divUokviri.style.border = '2px solid #007bff'
        divUokviri.style.padding = '15px';
        cardBodyDiv.appendChild(divUokviri);  
        

        const naslov = document.createElement("label");
        naslov.innerText = "Izaberite gde zelite da dodate story:"
        divUokviri.appendChild(naslov);
        

        const divIzaberi = document.createElement('div');
        divIzaberi.classList.add('divIzaberi');
        divUokviri.appendChild(divIzaberi);

        const dodajDugme = document.createElement("button");
        dodajDugme.classList.add("dugmeDodaj");
        dodajDugme.innerText = "Dodaj"
        dodajDugme.addEventListener('click', function() {
             dodajuBazu(storyId);
        });
        divUokviri.appendChild(dodajDugme);
        

        
        highlights.forEach(obj => {


            const radioButton = document.createElement('input');
            radioButton.type = 'radio';
            radioButton.name = 'izaberi'; // Postavite jedinstveno ime grupe radio dugmadi ako je potrebno
            radioButton.value = obj.id; 
            divIzaberi.appendChild(radioButton);
 
            const label = document.createElement('label');
            label.classList.add("labelaIzaberi")
            label.innerHTML = obj.name;
            label.style.margin = '10px';
            divIzaberi.appendChild(label);

           
            
        });

         

    } catch (error) {
        console.error('Error getting highlights:', error);
        
    }
}

async function dodajuBazu(storyId){
    const radioDugmad = document.querySelectorAll('.divIzaberi input[type="radio"]');

    let highlightId = null;

    radioDugmad.forEach(radio => {
        if (radio.checked) {
            //ovo je zapravo id highlight
            highlightId = radio.value;
        }
    });

    
    const result = await addStoryToHighlight(highlightId, storyId);

    
    
}

async function getHighlightsByUserId() {
    var decode=new Decode();
    var korisnik=await decode.vratiKorisnika();

    const userId = korisnik.id;
    try {
        const response = await fetch(`http://localhost:5142/Highlight/getHighlightsFromUser/${userId}`);

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`);
        }

        const highlights = await response.json();
       
        return highlights;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function addStoryToHighlight(highlightId, storyId) {
    try {
        const response = await fetch(`http://localhost:5142/Highlight/${highlightId}/AddStory/${storyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 409) {
            alert( 'Story je vec dodat.');
            console.log('Story already exists in the highlight.');
            return { success: false, message: 'Story je vec dodat.' };
        }

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


async function KorisnikNaCijemSmoProfilu() {
    return new Promise(async (resolve, reject) => {
        try {
            var storedSearchValue = localStorage.getItem('searchValue');
            console.log(storedSearchValue);

            const response = await fetch(`http://localhost:5142/User/getUserByUsername/${storedSearchValue}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            if (response.status === 204) {
                console.error('No data found');
                reject(new Error('No data found'));
            }

            const data = await response.json();
            console.log(data.id);
            resolve(data.id);
        } catch (error) {
            console.error('Error while fetching user data:', error.message);
            reject(error);
        }
    });
}

async function provera() {
    try {
        var decode = new Decode();
        var korisnik = await decode.vratiKorisnika();

        const userId = korisnik.id;

        var idkorisnikaProfila = await KorisnikNaCijemSmoProfilu();
        console.log(idkorisnikaProfila);
        console.log(userId);

        if (idkorisnikaProfila === userId) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error in provera:', error.message);
        return false;
    }
}



