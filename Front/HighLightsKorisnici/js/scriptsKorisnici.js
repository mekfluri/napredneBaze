import { Decode } from "http://127.0.0.1:5501/Front/decode.js";

const fetchHighlights = async () => {
    var highlightsData;
    try {
        
       
        const urlParams = new URLSearchParams(window.location.search);
        var userUsername = urlParams.get('dataId');
        console.log(userUsername);

        var userId = await vratiKorisnika(userUsername);
        console.log(userId);

        const response = await fetch(`http://localhost:5142/Highlight/getHighlightsFromUser/${userId}`);
         highlightsData = await response.json();
        
        console.log(highlightsData);

        const container = document.querySelector('.container-fluid');
        for (const data of highlightsData) {
            const section = document.createElement('section');
            section.classList.add('resume-section');
            section.id = data.id;



           

            
         

         
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('resume-section-content');
            contentDiv.id = data.id;

            const heading = document.createElement('h2');
            heading.classList.add('mb-5');
            heading.textContent = data.name;

            const description = document.createElement('p');
            description.textContent = data.description;

            const storiesContainer = document.createElement('div');
            storiesContainer.id = 'storiesContainer';
             
            
         
            try {
                const storyIframe = document.createElement('iframe');
                storyIframe.src = `../Story/story.html?dataId=${data.id}`; 
                storyIframe.style.width = '100%';
                storyIframe.style.height = '400px'; // Set the height as needed

              

                contentDiv.appendChild(heading);
                contentDiv.appendChild(description);
                contentDiv.appendChild(storyIframe);

            } catch (error) {
                console.error(`Error fetching story data: ${error.message}`);
            }
                const button3 = document.createElement('button');
            button3.classList.add('button');
            button3.textContent = "Vasi storiji";
            container.appendChild(button3);
       
           button3.onclick = async () => {
                try {

                const url = `http://127.0.0.1:5501/Front/Story/SviStorijiKorisnika.html?dataId=${userId}`;
                window.location.href = url;
                } catch (error) {
                console.error("Error:", error.message);
                }
                };
            section.appendChild(contentDiv);
            container.appendChild(section);
            container.appendChild(document.createElement('hr'));
        }
    } catch (error) {
        console.error(`Error fetching highlights data: ${error.message}`);
    }
       const navList = document.querySelector('.navbar-nav');
            for (const data of highlightsData) {
            const listItem = document.createElement('li');
            listItem.classList.add('nav-item');

            const link = document.createElement('a');
            link.classList.add('nav-link', 'js-scroll-trigger');
            link.textContent = data.name;
            link.href = `#${data.name.toLowerCase()}`; 

            listItem.appendChild(link);
            navList.appendChild(listItem);
        }




};

window.addEventListener('DOMContentLoaded', fetchHighlights);


async function vratiKorisnika(username){
   console.log(username);

    return await fetch(`http://localhost:5142/User/getUserByUsername/${username}`, {
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
        
        return data.id;
    })
    .catch(error => {
        console.error('Error while fetching user data:', error);
    });
}













