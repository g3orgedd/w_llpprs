async function downloadImage(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading image:', error);
    }
}

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
    currentColor = colorSelect !== 'colors' ? colorSelect : 'green';
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

        const fragment = document.createDocumentFragment(); // Use a document fragment for efficiency

        data.results.forEach(photo => {
            const width = photo.width;
            const height = photo.height;
            const aspectRatio = width / height;
            const minWidth = 200;
            const minHeight = minWidth / aspectRatio;

            // Create image container dynamically
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            imageContainer.style.minWidth = `${minWidth}px`;
            imageContainer.style.minHeight = `${minHeight}px`;

            // Create spinner
            const spinner = document.createElement('div');
            spinner.classList.add('spinner');
            imageContainer.appendChild(spinner);

            // Create image element
            const img = document.createElement('img');
            img.src = photo.urls.regular;
            img.alt = photo.alt_description;
            img.classList.add('image-to-animate');
            img.loading = 'lazy';
            imageContainer.appendChild(img);

            // Create download button
            const downloadButton = document.createElement('button');
            downloadButton.classList.add('download-btn');
            downloadButton.style.display = 'none';
            downloadButton.dataset.rawUrl = photo.urls.raw;

            const downloadIcon = document.createElement('img');
            downloadIcon.src = 'assets/svg/download.svg';
            downloadIcon.alt = 'Download';
            downloadButton.appendChild(downloadIcon);
            imageContainer.appendChild(downloadButton);

            fragment.appendChild(imageContainer); // Append the whole container to the fragment
        });

        imageGallery.appendChild(fragment); // Append all new image containers to the gallery at once

        const newImages = imageGallery.querySelectorAll('.image-container:not(.animated)'); // Select only new containers

        newImages.forEach(container => {
            container.classList.add('animated'); // Mark as animated so it's not animated again
        });


        document.querySelectorAll('.image-to-animate').forEach((img, index) => {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
                if (img.previousElementSibling) {
                    img.previousElementSibling.remove(); // delete spinner if exists
                }
                img.nextElementSibling.style.display = 'block'; // show download button
            });
        });

        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', () => {
                const url = button.getAttribute('data-raw-url');
                downloadImage(url);
            });
        });

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

document.addEventListener('DOMContentLoaded', function() {
    const loadButton = document.getElementById('loadBttn');
    const control = document.querySelector('.control');

    loadButton.addEventListener('click', function() {
        // moving .control upward
        control.style.position = 'sticky';
        control.style.top = '0';
        control.style.left = '0';
        control.style.transform = 'translate(0, 0)';
    });
});
