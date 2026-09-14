import { createClient } from "@supabase/supabase-js";
import {
  requireAdmin,
  unauthorized
} from "./auth.js";

const supabase =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );

export default async function handler(
  req,
  res
) {

  try {

    await requireAdmin(req);

    const {
      data,
      error
    } =
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
          image_url,
          seo_title,
          seo_description,
          published,
          published_at,
          created_at,
          source_title,
          source_url
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(100);

    if (error) {

      return res.status(500).json({
        error: error.message
      });

    }

    return res.status(200).json({

      success: true,

      articles:
        data || []

    });

  } catch (error) {

    if (
      error.message ===
      "UNAUTHORIZED"
    ) {
      return unauthorized(res);
    }

    return res.status(500).json({
      error: error.message
    });

  }

}
