document.getElementById("predictButton").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const resultDiv = document.getElementById("result");
    const uploadedImage = document.getElementById("uploadedImage");
    const predictButton = document.getElementById("predictButton");

    if (!fileInput.files[0]) {
        resultDiv.innerHTML = '<p class="text-red-500">Please upload an image first.</p>';
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    uploadedImage.src = URL.createObjectURL(fileInput.files[0]);
    uploadedImage.classList.remove("hidden");

    resultDiv.innerHTML = '<p class="text-green-600 loading">Analyzing your plant...</p>';
    predictButton.disabled = true;

    fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        predictButton.disabled = false;
        if (data.predicted_class) {
            // Store the original prediction result
            const predictionResult = `
                <div class="bg-green-50 p-6 rounded-lg">
                    <h4 class="text-xl font-semibold text-green-800 mb-3">Diagnosis Results</h4>
                    <p class="text-green-700 mb-2">${data.predicted_class}</p>
                    <p class="text-sm text-green-600">Our AI has analyzed your plant's condition with high confidence.</p>
                </div>
            `;
            
            // Get cure recommendations from Gemini
            const genAI = new GoogleGenerativeAI('AIzaSyAFPD2_cON-ga5b4S59dJ-2P1B0QoDiHSI'); // Replace with your API key
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            
            model.generateContent(`Provide a detailed treatment plan for the plant disease: ${data.predicted_class}. 
                Include immediate actions, treatment methods, and preventive measures.`)
                .then(result => result.response)
                .then(response => {
                    // Add cure recommendations below the original prediction
                    resultDiv.innerHTML = predictionResult + `
                        <div class="bg-green-50 p-6 rounded-lg mt-4">
                            <h4 class="text-xl font-semibold text-green-800 mb-3">Treatment Recommendations</h4>
                            <div class="text-green-700">
                                ${response.text()}
                            </div>
                        </div>
                    `;
                })
                .catch(error => {
                    // If AI fails, still show the original prediction
                    resultDiv.innerHTML = predictionResult;
                    console.error("Error getting cure:", error);
                });
        } else {
            resultDiv.innerHTML = '<p class="text-red-500">Error in analysis. Please try again.</p>';
        }
    })
    .catch(error => {
        console.error("Error:", error);
        predictButton.disabled = false;
        resultDiv.innerHTML = '<p class="text-red-500">Failed to analyze image. Please try again.</p>';
    });
});

// Preview image on file select
document.getElementById("fileInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const uploadedImage = document.getElementById("uploadedImage");
        uploadedImage.src = URL.createObjectURL(file);
        uploadedImage.classList.remove("hidden");
    }
});

// Drag and drop functionality
const uploadArea = document.querySelector('.upload-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    uploadArea.classList.add('bg-green-50');
}

function unhighlight(e) {
    uploadArea.classList.remove('bg-green-50');
}

uploadArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    const fileInput = document.getElementById('fileInput');
    fileInput.files = files;

    if (files[0]) {
        const uploadedImage = document.getElementById("uploadedImage");
        uploadedImage.src = URL.createObjectURL(files[0]);
        uploadedImage.classList.remove("hidden");
    }
}
