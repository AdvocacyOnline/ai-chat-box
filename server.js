const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files in the "public" folder
app.use(express.static("public"));

// Set up OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle POST /chat requests
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).send({ error: "No message provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are a helpful assistant for people living in Wales.
Your job is to:
- Listen to the user's story or question about care, social services, or wellbeing.
- Paraphrase their story or question clearly.
- Give relevant factual information ONLY from the Social Services and Well-being (Wales) Act 2014.
- Always include links to the Act on https://www.legislation.gov.uk/ and relevant Citizens Advice pages at https://www.citizensadvice.org.uk/.
- Provide contact details for local authority social services or trusted organisations if relevant.
- Explain what the user can expect when they contact those organisations.
- Suggest what they can say or do to ensure their wants, wishes, and feelings are properly heard.
- NEVER give legal advice or opinions. Only provide factual options and resources.
          `,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const botResponse = completion.choices[0].message.content;
    res.send({ response: botResponse });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Something went wrong" });
  }
});

// Serve the chat page at "/"
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
