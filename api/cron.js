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


  try {


    // Vercel Cron security

    const auth =
      req.headers.authorization;


    if (
      process.env.CRON_SECRET &&
      auth !==
        `Bearer ${process.env.CRON_SECRET}`
    ) {

      return res.status(401).json({

        error:
          "Unauthorized"

      });

    }


    // Get RSS source

    const {
      data: sources,
      error: sourceError
    } =
      await supabase
        .from("rss_sources")
        .select("*")
        .eq("active", true)
        .limit(1);


    if (sourceError) {

      throw sourceError;

    }


    if (
      !sources ||
      sources.length === 0
    ) {

      throw new Error(
        "No RSS source found"
      );

    }


    const source =
      sources[0];


    const rssResponse =
      await fetch(source.url);


    const xml =
      await rssResponse.text();


    const items =
      xml.match(
        /<item[\s\S]*?<\/item>/g
      ) || [];


    if (items.length === 0) {

      throw new Error(
        "No RSS articles found"
      );

    }


    const first =
      items[0];


    const titleMatch =
      first.match(
        /<title><!\[CDATA\[(.*?)\]\]><\/title>/
      );


    const linkMatch =
      first.match(
        /<link>(.*?)<\/link>/
      );


    const sourceTitle =
      titleMatch
        ? titleMatch[1]
        : "Latest News";


    const sourceUrl =
      linkMatch
        ? linkMatch[1]
        : "";


    // Generate AI article

    const prompt = `

Rewrite the following news topic
into an original Bangla article.

Do not copy the source article.

Do not invent facts.

Topic:
${sourceTitle}

Source:
${sourceUrl}

Return JSON only:

{
 "title": "",
 "summary": "",
 "content": "",
 "seo_title": "",
 "seo_description": ""
}

`;


    const aiResponse =
      await fetch(
        "https://api.openai.com/v1/responses",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${process.env.OPENAI_API_KEY}`

          },

          body: JSON.stringify({

            model:
              "gpt-5.6-luna",

            input:
              prompt

          })

        }
      );


    const aiData =
      await aiResponse.json();


    const article =
      JSON.parse(
        aiData.output_text
      );


    const slug =
      makeSlug(
        article.title
      );


    // Save and publish

    const {
      data,
      error
    } =
      await supabase
        .from("articles")
        .insert({

          title:
            article.title,

          slug,

          summary:
            article.summary,

          content:
            article.content,

          category:
            source.category,

          language:
            "bn",

          source_title:
            sourceTitle,

          source_url:
            sourceUrl,

          seo_title:
            article.seo_title,

          seo_description:
            article.seo_description,

          published:
            true,

          published_at:
            new Date().toISOString()

        })
        .select()
        .single();


    if (error) {

      throw error;

    }


    return res.status(200).json({

      success: true,

      message:
        "Daily article published",

      article:
        data

    });


  } catch (error) {


    return res.status(500).json({

      success: false,

      error:
        error.message

    });

  }

}
