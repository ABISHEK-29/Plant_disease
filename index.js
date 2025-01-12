// Variables for UI elements
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendMessageButton = document.getElementById("sendMessage");
const closeChatButton = document.getElementById("closeChat");
const fileInput = document.getElementById("fileInput");
const predictButton = document.getElementById("predictButton");
const uploadedImage = document.getElementById("uploadedImage");
const resultDiv = document.getElementById("result");

// Constants for Gemini API
const geminiAPIKey = "AIzaSyAFPD2_cON-ga5b4S59dJ-2P1B0QoDiHSI";
const geminiURL = "https://gemini.googleapis.com/v1beta/generateText";

// Preview image on file select
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadedImage.src = URL.createObjectURL(file);
    uploadedImage.classList.remove("hidden");
  }
});

// Drag and drop functionality
const uploadArea = document.querySelector(".upload-area");

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

["dragenter", "dragover"].forEach((eventName) => {
  uploadArea.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
  uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  uploadArea.classList.add("bg-green-50");
}

function unhighlight() {
  uploadArea.classList.remove("bg-green-50");
}

uploadArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  fileInput.files = files;

  if (files[0]) {
    uploadedImage.src = URL.createObjectURL(files[0]);
    uploadedImage.classList.remove("hidden");
  }
}

// Predict button click event
predictButton.addEventListener("click", () => {
  if (!fileInput.files[0]) {
    resultDiv.innerHTML = '<p class="text-red-500">Please upload an image first.</p>';
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  resultDiv.innerHTML = '<p class="text-green-600 loading">Analyzing your plant...</p>';
  predictButton.disabled = true;

  fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      predictButton.disabled = false;
      if (data.predicted_class) {
        resultDiv.innerHTML = `
          <div class="bg-green-50 p-6 rounded-lg">
            <h4 class="text-xl font-semibold text-green-800 mb-3">Diagnosis Results</h4>
            <p class="text-green-700 mb-2">${data.predicted_class}</p>
          </div>`;
        fetchTreatmentPlan(data.predicted_class).then((treatment) => {
          resultDiv.innerHTML += `
            <div class="bg-green-50 p-6 rounded-lg mt-4">
              <h4 class="text-xl font-semibold text-green-800 mb-3">Treatment Recommendations</h4>
              <div class="text-green-700">${treatment}</div>
            </div>`;
        });
      } else {
        resultDiv.innerHTML = '<p class="text-red-500">Error in analysis. Please try again.</p>';
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      predictButton.disabled = false;
      resultDiv.innerHTML = '<p class="text-red-500">Failed to analyze image. Please try again.</p>';
    });
});

// Fetch treatment plan using Gemini API
function fetchTreatmentPlan(diseaseName) {
  const prompt = `Provide a detailed treatment plan for the plant disease: ${diseaseName}.
  Include immediate actions, treatment methods, and preventive measures.`;

  return fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${geminiAPIKey}`,
    },
    body: JSON.stringify({
      prompt,
      max_tokens: 200,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.text) {
        return data.text;
      } else {
        throw new Error("Failed to fetch treatment plan.");
      }
    });
}

// Chatbot message handling
function appendMessage(content, isBot = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${isBot ? "bot" : "user"}`;
  messageDiv.textContent = content;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendMessageButton.addEventListener("click", () => {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage(userMessage, false);
  chatInput.value = "";

  fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${geminiAPIKey}`,
    },
    body: JSON.stringify({
      prompt: `Answer the following query related to plant diseases: ${userMessage}`,
      max_tokens: 150,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.text) {
        appendMessage(data.text, true);
      } else {
        appendMessage("Sorry, I couldn't fetch a response.", true);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      appendMessage("An error occurred. Please try again.", true);
    });
});

// Close chatbot
closeChatButton.addEventListener("click", () => {
  document.querySelector(".fixed").classList.toggle("hidden");
});
