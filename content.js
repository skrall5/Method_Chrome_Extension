// For Work Order Images (https://overheaddoorcoofeasternidaho.method.me/apps/Default.aspx#/bf4dfc11-26a7-4768-8775-bbe03cc97bc9)

// PROD TODO: Publish the work order screen with my changes (Made it so that images weren't inside an a tag)

// --- ADD THE OPTION TO SELECT --- //
function handleConfirmBody(confirmBody) {
    if (!confirmBody) return;

    const children = Array.from(confirmBody.children);
    const allAreImages = children.length > 0 && children.every(child => child.tagName === "IMG");
    if (!allAreImages) return;

    console.log("Processing confirmBody images...");

    children.forEach((image) => {
        // Avoid rewrapping if we've already processed this image
        if (image.parentElement.classList.contains("image-wrapper")) return;

        // Create a wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "image-wrapper";
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.margin = "4px";
        wrapper.dataset.selected = "false";

        // Insert wrapper before image, then move image inside it
        image.parentNode.insertBefore(wrapper, image);
        wrapper.appendChild(image);

        // Create the bubble
        const bubble = document.createElement("div");
        bubble.className = "select-bubble";
        bubble.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            border: 2px solid #0d71c8;
            cursor: pointer;
            z-index: 9999;
            transition: background 0.2s ease;
        `;

        // Helper function to toggle selection
        const toggleSelection = () => {
            const selected = wrapper.dataset.selected === "true";
            wrapper.dataset.selected = (!selected).toString();

            if (selected) {
                bubble.style.background = "white";
                wrapper.style.outline = "none";
            } else {
                bubble.style.background = "#0d71c8";
                wrapper.style.outline = "2px solid #0d71c8";
            }

            // Log all currently selected images
            // const selectedImages = Array.from(document.querySelectorAll(".image-wrapper[data-selected='true']"))
            //     .map(w => w.querySelector("img").src);
            // console.log("Currently selected images:", selectedImages);
        };

        // Toggle when clicking the bubble
        bubble.addEventListener("click", e => {
            e.stopPropagation(); // prevent duplicate toggles
            toggleSelection();
        });

        // Toggle when clicking the image itself
        image.addEventListener("click", e => {
            e.preventDefault();
            toggleSelection();
        });

        wrapper.appendChild(bubble);
    });
}
// --- ADD THE OPTION TO SELECT END --- //


// --- ADD THE DOWNLOAD BUTTON --- //
function addDownloadButton(footer) {
    if (!footer) return;

    // Prevent duplicates
    if (document.getElementById("download-selected-images-btn")) return;

    // Create and style the button
    const downloadBtn = document.createElement("button");
    downloadBtn.id = "download-selected-images-btn";
    downloadBtn.type = "button";
    downloadBtn.textContent = "Download Selected";
    downloadBtn.className = "download-selected-btn";

    // Inject CSS hover styles (only once)
    if (!document.getElementById("download-selected-btn-style")) {
        const style = document.createElement("style");
        style.id = "download-selected-btn-style";
        style.textContent = `
            .download-selected-btn {
                -webkit-text-size-adjust: 100%;
                -webkit-font-smoothing: antialiased;
                font: inherit;
                cursor: pointer;
                background-color: rgb(13, 113, 200);
                color: rgb(255, 255, 255);
                min-height: 32px;
                padding: 6px 16px;
                align-items: center;
                box-sizing: border-box;
                font-size: 14px;
                font-weight: 600;
                width: auto;
                line-height: 18px;
                border: 1px solid rgb(13, 113, 200);
                border-radius: 17px !important;
                margin: 1px 8px;
                transition: background-color 0.2s ease;
            }

            .download-selected-btn:hover {
                background-color: #0b5ea8;
            }
        `;
        document.head.appendChild(style);
    }

    // Download logic
    downloadBtn.addEventListener("click", async () => {
        const selectedImages = Array.from(document.querySelectorAll(".image-wrapper[data-selected='true']"))
            .map(w => w.querySelector("img").src);

        if (selectedImages.length === 0) {
            alert("Please select at least one image to download.");
            return;
        }

        for (const src of selectedImages) {
            try {
                const filename = src.split("/").pop().split("?")[0] || "image.jpg";
                chrome.runtime.sendMessage({
                    action: "download",
                    url: src,
                    filename: filename
                });
            } catch (err) {
                console.error("Failed to download image:", src, err);
            }
        }
    });

    footer.insertBefore(downloadBtn, footer.firstChild);
}
// --- ADD THE DOWNLOAD BUTTON END --- //

// Watch for changes to appear
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue; // Non-element node

            const confirmBody = node.id === "confirmBody"
                ? node
                : node.querySelector("#confirmBody");

            if (confirmBody) handleConfirmBody(confirmBody);

            const footer = node.className === "dialog-footer__buttons"
                ? node
                : node.querySelector(".dialog-footer__buttons");

            if (footer) addDownloadButton(footer);
        }
    }
});
observer.observe(document.body, { childList: true, subtree: true });