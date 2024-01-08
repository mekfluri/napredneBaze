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

                cardFooterDiv.appendChild(likesLink);
                  cardFooterDiv.appendChild(buttonDelete);
                  //cardFooterDiv.appendCHild(buttonHigh);
                     cardFooterDiv.appendChild(buttonEdit);
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