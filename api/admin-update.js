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

  if (req.method !== "POST") {

    return res.status(405).json({
      error:
        "Method not allowed"
    });

  }

  try {

    await requireAdmin(req);

    const {
      id,
      title,
      summary,
      content,
      category,
      seo_title,
      seo_description,
      image_url
    } = req.body || {};

    if (!id || !title || !content) {

      return res.status(400).json({
        error:
          "ID, title and content are required"
      });

    }

    const { data, error } =
      await supabase
        .from("articles")
        .update({

          title,

          summary:
            summary || "",

          content,

          category:
            category || "news",

          seo_title:
            seo_title || title,

          seo_description:
            seo_description ||
            summary ||
            "",

          image_url:
            image_url || null

        })
        .eq("id", id)
        .select()
        .single();

    if (error) {

      return res.status(500).json({
        error:
          error.message
      });

    }

    return res.status(200).json({

      success: true,

      article: data

    });

  } catch (error) {

    if (
      error.message ===
      "UNAUTHORIZED"
    ) {
      return unauthorized(res);
    }

    return res.status(500).json({
      error:
        error.message
    });

  }

}
