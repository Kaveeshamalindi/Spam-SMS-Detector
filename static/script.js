
const messageInput = document.getElementById("message");

const checkBtn = document.getElementById("checkBtn");

const clearBtn = document.getElementById("clearBtn");

const result = document.getElementById("result");

const resultIcon = document.getElementById("resultIcon");

const resultTitle = document.getElementById("resultTitle");

const resultDescription =
    document.getElementById("resultDescription");

const buttonText = document.getElementById("buttonText");

const charCount = document.getElementById("charCount");


// Update character count

messageInput.addEventListener("input", function () {

    charCount.textContent =
        `${messageInput.value.length} / 5000`;

});


// Clear message and results

clearBtn.addEventListener("click", function () {

    messageInput.value = "";

    charCount.textContent = "0 / 5000";

    result.className = "result hidden";

    messageInput.focus();

});


// Display prediction

function showResult(prediction) {

    result.classList.remove("hidden", "spam", "ham", "error");

    if (prediction === "Spam") {

        result.classList.add("spam");

        resultIcon.textContent = "⚠️";

        resultTitle.textContent = "Spam Message Detected!";

        resultDescription.textContent =
            "This message has been classified as spam.";

    } else {

        result.classList.add("ham");

        resultIcon.textContent = "✅";

        resultTitle.textContent = "Not Spam!";

        resultDescription.textContent =
            "This message has been classified as a normal message.";

    }

}


// Send message to Flask backend

async function checkSpam() {

    const message = messageInput.value.trim();

    if (!message) {

        result.className = "result error";

        resultTitle.textContent = "Message Required";

        resultIcon.textContent = "❗";

        resultDescription.textContent =
            "Please enter a message before analyzing.";

        return;

    }

    checkBtn.disabled = true;

    buttonText.textContent = "Analyzing...";

    result.className = "result hidden";


    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Prediction failed."
            );

        }


        showResult(data.prediction);


    } catch (error) {

        result.className = "result error";

        resultIcon.textContent = "❌";

        resultTitle.textContent = "Error";

        resultDescription.textContent = error.message;

    } finally {

        checkBtn.disabled = false;

        buttonText.textContent = "Analyze Message";

    }

}


// Button click event

checkBtn.addEventListener("click", checkSpam);


// Ctrl + Enter shortcut

messageInput.addEventListener("keydown", function (event) {

    if (event.ctrlKey && event.key === "Enter") {

        checkSpam();

    }

});
