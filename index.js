document.getElementById("predictButton").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const resultDiv = document.getElementById("result");
    const uploadedImage = document.getElementById("uploadedImage");

    if (!fileInput.files[0]) {
        resultDiv.innerText = "Please upload an image.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    uploadedImage.src = URL.createObjectURL(fileInput.files[0]);
    uploadedImage.style.display = "block";

    resultDiv.innerText = "Predicting...";

    fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.predicted_class) {
            resultDiv.innerText = `Prediction: ${data.predicted_class}`;
        } else {
            resultDiv.innerText = "Error in prediction.";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        resultDiv.innerText = "Failed to get prediction.";
    });
});
