import OpenAI from "openai";

document.getElementById('generateQuestionButton').addEventListener("click", async function (e) {
    // e.preventDefault();
    const aiHomeworkTopic = document.getElementById('questionTopics').value;
    const aiHomeworkNumber = document.getElementById('questionNumber').value;

    if (!aiHomeworkTopic || !aiHomeworkNumber) {
        alert("Please enter a value for the homework topic and the number of questions");
        return;
    }

    const aiHomeworkContainer = document.getElementById('ai_homework');
    const generatedQuestionsTextarea = document.createElement('textarea');
    generatedQuestionsTextarea.id = "generatedQuestions";
    generatedQuestionsTextarea.name = "generatedQuestions";
    aiHomeworkContainer.appendChild(generatedQuestionsTextarea);

    const openai = new OpenAI({
        apiKey: 'sk-None-kM2cIxtyNYoGsQRsElUMT3BlbkFJGUEEcj13iQR75iYoMT1a', // This is the default and can be omitted
    });

    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: 'You are a question bank, giving practice exam questions to users.' },
                { role: 'user', content: `Output ${aiHomeworkNumber} questions on the following topic: ${aiHomeworkTopic}.` }
            ],
            model: 'gpt-3.5-turbo',
        });

        generatedQuestionsTextarea.value = chatCompletion.choices.map(choice => choice.message.content).join('\n');

    } catch (error) {
        console.error(`Error generating questions: ${error.message}`);
        generatedQuestionsTextarea.value = 'Failed to generate questions due to a server error.';
    }
});
