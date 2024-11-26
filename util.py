import json
import pickle
import numpy as np
from PIL import Image
from tensorboard.plugins.image.summary import image

__location=None
__data_columns=None
__model=None





def load_and_preprocess_image(image, target_size=(256, 256)):
    """
    Preprocess an image for prediction. Accepts a PIL Image object or a numpy array.
    """
    # Convert the image to a NumPy array
    image_array = np.array(image)
    # If the input is a PIL Image, convert it to a numpy array
    if isinstance(image, Image.Image):
        img = image.resize(target_size)  # Resize the image
        img_array = np.array(img)  # Convert to numpy array
    elif isinstance(image, np.ndarray):
        # If it's already a numpy array, resize it
        img = Image.fromarray(image)
        img = img.resize(target_size)
        img_array = np.array(img)
    else:
        raise ValueError("Input must be a PIL.Image or a numpy array.")

    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    # Scale the image values to [0, 1]
    img_array = img_array.astype('float32') / 255.0
    return img_array


def predict_image_class(image):
    """
    Predict the class of the given image using the provided model.

    """
    load_saved_artifacts()
    preprocessed_img = load_and_preprocess_image(image)
    predictions = __model.predict(preprocessed_img)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_class_name = __data_columns[str(predicted_class_index)]

    return predicted_class_name


def load_saved_artifacts():
    print("loading saved artifacts")
    global __data_columns
    global __model
    with open("class_indices.json",'r') as f:
        __data_columns=json.load(f)
    with open("plant_disease_detection1.pickle","rb") as f:
        __model=pickle.load(f)

if __name__=="__main__":
    # Load the image
    image_path = '00e909aa-e3ae-4558-9961-336bb0f35db3___JR_FrgE.S 8593.JPG'
    image = Image.open(image_path)
    # Convert the image to a NumPy array
    image_array = np.array(image)

    # Pass the NumPy array to the function
    print(predict_image_class(image_array))