import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

function makeSlug(title) {

  return title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .substring(0, 100)
    + "-" + Date.now();

}


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
You are a professional AI news and story writer.

Create an original article.

Type:
${type}

Topic:
${topic}

Language:
${lang}

Approximate length:
${length} words.

Requirements:

- Write original content.
- Never copy another website word-for-word.
- Do not invent facts.
- If this is news, do not make unsupported claims.
- Create an SEO-friendly title.
- Create a short summary.
- Create a complete readable article.
- Create SEO title.
- Create SEO description.
- Use headings when appropriate.
- No fake quotations.
- Return JSON only.

JSON:

{
  "title": "",
  "summary": "",
  "content": "",
  "seo_title": "",
  "seo_description": ""
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


    let article;


    try {

      article =
        JSON.parse(
          data.output_text || ""
        );

    } catch {

      return res.status(500).json({

        error:
          "AI returned invalid JSON."

      });

    }


    const slug =
      makeSlug(article.title);


    const { data: saved, error } =
      await supabase
        .from("articles")
        .insert({

          title:
            article.title,

          slug:
            slug,

          summary:
            article.summary,

          content:
            article.content,

          category:
            type,

          language:
            language,

          seo_title:
            article.seo_title,

          seo_description:
            article.seo_description,

          published:
            false

        })
        .select()
        .single();


    if (error) {

      return res.status(500).json({

        error:
          "Database save failed",

        details:
          error.message

      });

    }


    return res.status(200).json({

      success: true,

      article: saved

    });


  } catch (error) {

    return res.status(500).json({

      error:
        "Server error",

      details:
        error.message

    });

  }

}
