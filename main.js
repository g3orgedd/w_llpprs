let currentPage = 1;
let currentQuery = 'nature';
let currentColor = 'green';

const predefinedColors = {
    "#FF0000": "red",
    "#00FF00": "green",
    "#0000FF": "blue",
    "#FFFF00": "yellow",
    "#FFA500": "orange",
    "#800080": "purple",
    "#000000": "black",
    "#FFFFFF": "white",
    "#008080": "teal",
    "#FF00FF": "magenta",
};

function componentToHex(component) {
    const hex = component.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function distance(color1, color2) {
    return Math.sqrt(
        (color1.r - color2.r) ** 2 +
        (color1.g - color2.g) ** 2 +
        (color1.b - color2.b) ** 2
    );
}

function closestColorName(rgb) {
    let closestColor = null;
    let minDistance = Infinity;

    for (const [key, name] of Object.entries(predefinedColors)) {
        const predefinedColor = hexToRgb(key);
        const dist = distance(rgb, predefinedColor);
        if (dist < minDistance) {
            minDistance = dist;
            closestColor = name;
        }
    }

    return closestColor;
}

document.getElementById("loadBttn").addEventListener("click", async () => {
    const fileInput = document.getElementById('inputBttn');
    const queryInput = document.getElementById('queryInput').value || 'nature';
    const colorSelect = document.getElementById('inputColors').value;

    currentQuery = queryInput;
    currentColor = colorSelect !== 'Colors' ? colorSelect : 'green';
    currentPage = 1; // reset page number on new search
    
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const img = new Image();

        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            const colorThief = new ColorThief();
            
            const dominantColor = colorThief.getColor(img);
            const colorName = closestColorName({ r: dominantColor[0], g: dominantColor[1], b: dominantColor[2] });
            currentColor = colorName;

            await searchImages(currentQuery, currentColor, currentPage);
        }; 
    } else {
        await searchImages(currentQuery, currentColor, currentPage);
    }
});

document.getElementById("loadMoreBttn").addEventListener("click", async () => {
    currentPage++;
    await searchImages(currentQuery, currentColor, currentPage);
});

async function searchImages(query = 'nature', color = 'green', page = 1) {
    const accessKey = '842G5ZO3RFQN5f9BdvdvU1xKBDM_f-2rqHyJlsQLvlQ';
    const apiFetch = `https://api.unsplash.com/search/photos?page=${page}&query=${query}&color=${color}&client_id=${accessKey}&per_page=10`;

    console.log(apiFetch);

    try {
        const response = await fetch(apiFetch);
        const data = await response.json();
        const imageGallery = document.querySelector('.image-gallery');

        if (page === 1) {
            imageGallery.innerHTML = ''; // clear old images only after first load
        }

        let htmlContent = '';
        data.results.forEach(photo => {
            // get image w & h 
            const width = photo.width; 
            const height = photo.height; 

            const aspectRatio = width / height; 
            // find minimus width and height for image container 
            const minWidth = 200; 
            const minHeight = minWidth / aspectRatio;

            htmlContent += `
                <div class="image-container" style="min-width: ${minWidth}px; min-height: ${minHeight}px;">
                    <div class="spinner"></div>
                    <img src="${photo.urls.regular}" alt="${photo.alt_description}" class="image-to-animate" loading="lazy" />
                </div>
            `;
        });

        // add all images at once
        imageGallery.innerHTML += htmlContent;

        // for every new images
        document.querySelectorAll('.image-to-animate').forEach(img => {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
                img.previousElementSibling.remove(); // delete spinner
            });
        });

        // show load more button only after first 10 images
        if (page === 1) {
            document.querySelector('.load-more-container').classList.add('loaded');
        }
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

// show button after scroll
document.addEventListener("DOMContentLoaded", () => { 
    const scrollTopBtn = document.getElementById("scrollTopBtn"); 
    window.addEventListener("scroll", () => { 
        if (window.scrollY > 500) { 
            scrollTopBtn.style.display = "block"; 
        } else { 
            scrollTopBtn.style.display = "none"; 
        } 
    }); 
    scrollTopBtn.addEventListener("click", () => { 
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        }); 
    }); 
});
/*
window.addEventListener('scroll', () => { 
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }

    scrollTopBtn.addEventListener("click", function() {
        document.body.scrollTop = 0; // for safari
        document.documentElement.scrollTop = 0; // for chromium
    });
});
*/

// scroll to top button
// document.getElementById("scrollTopBtn")

// window.addEventListener('resize', () => {
//     const inputForm = document.querySelector('.input-group');

//     if (window.innerWidth <= 650) {
//         inputForm.classList.add('input-group-lg');
//     } else {
//         inputForm.classList.remove('input-group-lg');
//     }
// });