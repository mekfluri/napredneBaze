import { Decode } from "http://127.0.0.1:5501/Front/decode.js";

const fetchHighlights = async () => {
    var highlightsData;
    try {
        
        const urlParams = new URLSearchParams(window.location.search);
        var userId = urlParams.get('dataId');

        const response = await fetch(`http://localhost:5142/Highlight/getHighlightsFromUser/${userId}`);
         highlightsData = await response.json();

        console.log(highlightsData);

        const container = document.querySelector('.container-fluid');
        for (const data of highlightsData) {
            const section = document.createElement('section');
            section.classList.add('resume-section');
            section.id = data.id;


            const button = document.createElement('button');
            button.classList.add('button');
            button.textContent = "Obrisi highlight";
            section.appendChild(button);

                  button.onclick = async () => {
                        try {
                            if (!section) throw new Error("Section is not defined.");
                            await fetch(`http://localhost:5142/Highlight/${section.id}`, { method: 'DELETE' });
                            alert(`Highlight with ID ${section.id} deleted successfully!`);
                            location.reload();
                        } catch (error) {
                            console.error("Error:", error.message);
                        }
                  };
            
         


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

var dodajDugme = document.getElementById("dodajHigh");
dodajDugme.addEventListener("click", () => {
          
    dodajHighLight();
});



function dodajHighLight()
{
    var divZaPrikaz = document.getElementById("dodajHighDiv");
    divZaPrikaz.style.display = (divZaPrikaz.style.display === "none" || divZaPrikaz.style.display === "") ? "flex" : "none";
    divZaPrikaz.style.flexDirection = 'column';   
    create();
    
}

async function create()
{
    var dodaj = document.getElementById("dodajH");
     dodaj.addEventListener("click", () => {
        var ime = document.getElementById("tekst1").value;
        var opis = document.getElementById("tekst3").value;
        console.log(ime);
      
    
        const urlParams = new URLSearchParams(window.location.search);
        var userId = urlParams.get('dataId');
    
        const highlight = {
            id: userId,
            name: ime,
            description: opis,
        };
        console.log(highlight);
    
        createHighlight(userId, highlight);
        
       
                    
    
    });

  
}



async function createHighlight(userId, highlight) {
    try {
        const response = await fetch(`http://localhost:5142/Highlight/CreateHighlight?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(highlight),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`);
        }

        const result = await response.json();
        location.reload();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }

    
}