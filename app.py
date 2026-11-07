
from flask import Flask, render_template, request, jsonify
import pickle
import nltk
import string
import os

from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords

app = Flask(__name__)

# Download NLTK resources
nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)

# Load trained model and TF-IDF vectorizer
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "spam_model.pkl"
)

with open(MODEL_PATH, "rb") as file:
    saved_data = pickle.load(file)

model = saved_data["model"]
tf_vec = saved_data["vectorizer"]

ps = PorterStemmer()
stop_words = set(stopwords.words("english"))


# Text preprocessing
def clean_text(text):

    text = text.lower()

    tokens = nltk.word_tokenize(text)

    words = []

    for word in tokens:

        if word.isalnum():
            words.append(word)

    words = [
        word for word in words
        if word not in stop_words
        and word not in string.punctuation
    ]

    words = [ps.stem(word) for word in words]

    return " ".join(words)


# Home page
@app.route("/")
def home():

    return render_template("index.html")


# Prediction API
@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json(silent=True) or {}

        message = data.get("message", "").strip()

        if not message:

            return jsonify({
                "error": "Please enter a message."
            }), 400

        # Preprocess message
        cleaned_message = clean_text(message)

        # TF-IDF transformation
        vector = tf_vec.transform([cleaned_message])

        # Model prediction
        prediction = model.predict(vector)[0]

        # Handle string labels
        result = (
            "Spam"
            if str(prediction).lower() == "spam"
            else "Not Spam"
        )

        return jsonify({
            "prediction": result,
            "original_message": message
        })

    except Exception as e:

        print("Prediction Error:", str(e))

        return jsonify({
            "error": "Something went wrong during prediction."
        }), 500


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
