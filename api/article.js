import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {

  try {

    const slug =
      req.query.slug;


    if (!slug) {

      return res.status(400).json({
        error: "Slug is required"
      });

    }


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
          language,
          source_title,
          source_url,
          image_url,
          seo_title,
          seo_description,
          published_at
        `)
        .eq("slug", slug)
        .eq("published", true)
        .single();


    if (error || !data) {

      return res.status(404).json({
        error: "Article not found"
      });

    }


    return res.status(200).json({

      success: true,

      article: data

    });


  } catch (error) {

    return res.status(500).json({

      error:
        error.message

    });

  }

}
