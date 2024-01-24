import { Decode } from "http://127.0.0.1:5501/Front/decode.js";

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch user ID
        const userIdResponse = await fetch('http://localhost:5142/User/getUserCurrent', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const userData = await userIdResponse.json();
        const userId = userData.id;

        // Fetch stories data
        const urlParams = new URLSearchParams(window.location.search);
        var highlightId = urlParams.get('dataId');
        const response = await fetch(`http://localhost:5142/Story/getStoriesByHighlightId/${highlightId}`);
        const storiesData = await response.json();

        const storiesContainer = document.getElementById('storiesContainer');

        storiesData.forEach(async (story, index) => {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col-lg-6');

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', 'mb-4');

            const cardBodyDiv = document.createElement('div');
            cardBodyDiv.classList.add('card-body');
            cardBodyDiv.id= story.id;
            console.log(cardBodyDiv.id);

            


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
            console.log(userData);
            creatorDiv.textContent = userData.userName;

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('text-muted', 'small');
            dateDiv.textContent = new Date(story.dateTimeCreated).toLocaleString();

            const p = document.createElement('p');
            p.textContent = story.url;

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
                    location.reload()
                     
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
            cardBodyDiv.appendChild(link);

            cardDiv.appendChild(cardBodyDiv);
            cardDiv.appendChild(cardFooterDiv);

            cardFooterDiv.appendChild(likesLink);

            colDiv.appendChild(cardDiv);
            storiesContainer.appendChild(colDiv);
        });
    } catch (error) {
        console.error(`Error fetching stories: ${error.message}`);
    }
});
async function Like(storyId,  likesLink) {
    try {
        var decode=new Decode();
        var korisnik=await decode.vratiKorisnika();

        var userId = korisnik.id;
        console.log(storyId)

        var response = await fetch(`http://localhost:5142/Story/likeStory/${storyId}/${userId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        var result = await response.json();
        console.log(result);
        
        if (result.errorMessage == 'User already liked the story') {
            var response1 = await fetch(`http://localhost:5142/Story/unlikeStory/${storyId}/${userId}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        }

        result = await response1.json();
        console.log(result)
        //likesLink.querySelector('strong').textContent = result.message;
        
       
        //return cardBodyDivId;
       
    } catch (error) {
        console.error(`Error liking story: ${error.message}`);
        return null;
    }
}