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
      published
    } = req.body || {};

    if (!id) {

      return res.status(400).json({
        error:
          "Article ID required"
      });

    }

    const updateData = {
      published:
        Boolean(published)
    };

    if (published) {

      updateData.published_at =
        new Date().toISOString();

    } else {

      updateData.published_at =
        null;

    }

    const {
      data,
      error
    } =
      await supabase
        .from("articles")
        .update(updateData)
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
