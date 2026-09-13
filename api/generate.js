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

    const lang =
      language === "en"
        ? "English"
        : "Bangla";

    const prompt = `
You are a professional AI article writer.

Create an original ${type} article.

Topic:
${topic}

Language:
${lang}

Approximate length:
${length} words.

Rules:

1. Do not copy text from another website.
2. Do not invent facts.
3. For news, use only information supplied in the topic and clearly avoid unsupported claims.
4. Create an attractive SEO-friendly title.
5. Create a short summary.
6. Create a well-structured article.
7. Use headings where appropriate.
8. Make the article easy to read on mobile.
9. Do not include fake quotes.
10. Return valid JSON only.

Return:

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

      const error =
        await response.text();

      return res.status(
        response.status
      ).json({
        error: "OpenAI API error",
        details: error
      });

    }

    const data =
      await response.json();

    const output =
      data.output_text || "";

    let article;

    try {

      article =
        JSON.parse(output);

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
