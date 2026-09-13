import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);


export default async function handler(req, res) {

  try {

    const { data, error } =
      await supabase
        .from("articles")
        .select(`
          id,
          title,
          slug,
          summary,
          content,
          category,
          image_url,
          seo_title,
          seo_description,
          published_at
        `)
        .eq("published", true)
        .order(
          "published_at",
          {
            ascending: false
          }
        )
        .limit(30);


    if (error) {

      return res.status(500).json({
        error: error.message
      });

    }


    return res.status(200).json({

      success: true,

      articles: data || []

    });


  } catch (error) {

    return res.status(500).json({

      error:
        error.message

    });

  }

}
