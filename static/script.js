document.addEventListener("DOMContentLoaded", async () => {
    const textElement = document.getElementById("original-text");
    const resultElement = document.getElementById("result");
    const speakButton = document.getElementById("speak-btn");
    const skipButton = document.getElementById("skip-btn");
    const showAnswerButton = document.getElementById("show-answer-btn");

    let sentences = [];
    let currentSentence = "";

    // JSON-dan turkcha so‘zlarni yuklash
    async function loadSentences() {
        try {
            let response = await fetch("/sentences");
            sentences = await response.json();
            getRandomSentence();  // Yangi so‘z chiqarish
        } catch (error) {
            console.error("Xato:", error);
        }
    }

    // Tasodifiy so‘z chiqarish
    function getRandomSentence() {
        if (sentences.length > 0) {
            currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
            textElement.textContent = currentSentence;
            resultElement.textContent = "";  // Natija oynasini tozalash
        } else {
            textElement.textContent = "So‘zlar yuklanmadi.";
        }
    }

    // Foydalanuvchi ovozini qabul qilish
    speakButton.addEventListener("click", () => {
        let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "uz-UZ";  // O‘zbek tilida gapirish
        recognition.start();

        recognition.onresult = function(event) {
            let spokenText = event.results[0][0].transcript;
            console.log("Siz aytdingiz:", spokenText);

            // Backendga javobni yuborish
            fetch("/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ original: currentSentence, spoken: spokenText })
            })
            .then(response => response.json())
            .then(data => {
                // Natijani ko'rsatish
                resultElement.innerHTML = `Siz aytdingiz: <strong>${spokenText}</strong><br>${data.result}`;
                if (data.result === "✅ To‘g‘ri!") {
                    playSound("correct");  // To'g'ri javob uchun ovoz
                } else {
                    playSound("incorrect");  // Noto'g'ri javob uchun ovoz
                }
            })
            .catch(error => console.error("Xato:", error));
        };
    });

    // "Keyingisiga o'tish" tugmasi
    skipButton.addEventListener("click", () => {
        getRandomSentence();
    });

    // "To‘g‘ri javobni ko‘rsatish" tugmasi
    showAnswerButton.addEventListener("click", () => {
        fetch("/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ original: currentSentence, spoken: "" })
        })
        .then(response => response.json())
        .then(data => {
            if (data.result && data.result.includes("❌ Noto‘g‘ri")) {
                resultElement.innerHTML = `Siz aytdingiz: <strong>...</strong><br>${data.result}`;
            }
        })
        .catch(error => console.error("Xato:", error));
    });

    // Ovozli javoblar uchun funksiya
    function playSound(type) {
        let audio = new Audio();
        audio.src = type === "correct" ? "/static/correct-answer.mp3" : "/static/incorrect-answer.mp3";
        audio.play();
    }

    loadSentences();  // Sahifa yuklanganda JSON-dan so‘zlarni yuklash
});