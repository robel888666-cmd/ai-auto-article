export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      topic,
      type = "news",
      language = "bn",
      length = "1000"
    } = req.body || {};

    if (!topic) {
      return res.status(400).json({
        error: "Topic is required"
      });
    }

    const languageName =
      language === "en" ? "English" : "Bangla";

    const prompt = `
You are an AI article writer.

Create an original ${type} article.

Topic:
${topic}

Language:
${languageName}

Approximate length:
${length} words

Requirements:
- Write an original article.
- Do not copy another website.
- Do not invent facts.
- If the topic is news, clearly distinguish verified facts from uncertainty.
- Create an attractive title.
- Create a short summary.
- Create the full article.
- Use clear headings.
- Make it easy to read on mobile.

Return only valid JSON in this format:

{
  "title": "Article title",
  "summary": "Short summary",
  "content": "Full article"
}
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          input: prompt
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "OpenAI API error",
        details: errorText
      });
    }

    const data = await response.json();

    const output =
      data.output_text || "";

    let article;

    try {
      article = JSON.parse(output);
    } catch {
      article = {
        title: topic,
        summary: "",
        content: output
      };
    }

    return res.status(200).json({
      success: true,
      article
    });

  } catch (error) {

    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
