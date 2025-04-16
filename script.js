console.log("JS file loaded!");

const memeForm = document.getElementById("memeForm");
const memeGallery = document.getElementById("memeGallery");

memeForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get and trim input values
  const topText = document.getElementById("topText").value.trim();
  const bottomText = document.getElementById("bottomText").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();

  // Form validation
  if (!topText || !bottomText || !imageUrl) {
    alert("Please fill in all fields.");
    return;
  }

  // Create a wrapper to hold meme and delete button
  const memeWrapper = document.createElement("div");
  memeWrapper.classList.add("meme-wrapper");

  // Create the meme container
  const meme = document.createElement("div");
  meme.classList.add("meme");

  // Create the image element
  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = "Meme Image";

  // Create top and bottom text
  const top = document.createElement("div");
  top.classList.add("meme-text", "top");
  top.innerText = topText;

  const bottom = document.createElement("div");
  bottom.classList.add("meme-text", "bottom");
  bottom.innerText = bottomText;

  // Append image and text to meme container
  meme.appendChild(img);
  meme.appendChild(top);
  meme.appendChild(bottom);

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete Meme";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", function () {
    memeWrapper.remove();
  });

  // Append meme and delete button to the wrapper
  memeWrapper.appendChild(meme);
  memeWrapper.appendChild(deleteBtn);

  // Append everything to the gallery
  memeGallery.appendChild(memeWrapper);

  // Clear form fields
  memeForm.reset();
});