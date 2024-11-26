"""from io import BytesIO
from tkinter import Image
from fastapi import FastAPI, File, UploadFile
import numpy as np
import tensorflow as tf
import uvicorn
from PIL import Image

import util
from fastapi.responses import JSONResponse
app = FastAPI()
#MODEL = tf.keras.models.load_models("model/saved_model.pb")


@app.get("/ping")
async def ping():
    return f"welcome to fastAPI"
def readimagefile(data)->np.ndarray:
    image=np.array(Image.open(BytesIO(data)))
    return image

def fileupload_read():
    print('upload file..')
    file: UploadFile = File(...)
    image_read = readimagefile(file)
    img_batch = np.expand_dims(image_read, 0)
    predict(image_read)
@app.post("/predict")
async def predict(image_read):
    response = {
        'predicted_class':util.predict_image_class(image_read)
    }
    return JSONResponse(content=response, headers={"Access-Control-Allow-Origin": "*"})


def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image


if __name__ == "__main__":
    fileupload_read()
    uvicorn.run(app, host="localhost", port=8000)"""

from io import BytesIO
from fastapi import FastAPI, File, UploadFile
import numpy as np
from PIL import Image
import uvicorn
from fastapi.responses import JSONResponse

import util  # Assuming util contains the predict_image_class function

app = FastAPI()

@app.get("/ping")
async def ping():
    return {"message": "Welcome to FastAPI"}

def read_image_file(data: bytes) -> np.ndarray:
    """
    Convert image bytes into a NumPy array.
    """
    image = Image.open(BytesIO(data))
    return np.array(image)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read the file content as bytes
    file_bytes = await file.read()

    # Convert bytes to NumPy array
    image_read = read_image_file(file_bytes)

    # Add batch dimension if required by the model
    img_batch = np.expand_dims(image_read, axis=0)

    # Get prediction
    response = {
        'predicted_class': util.predict_image_class(image_read)
    }

    # Return response with CORS headers
    return JSONResponse(content=response, headers={"Access-Control-Allow-Origin": "*"})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
