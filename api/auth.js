import { jwtVerify } from "jose";

function getSecret() {

  return new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET
  );

}

function getCookie(req, name) {

  const cookie =
    req.headers.cookie || "";

  const parts =
    cookie.split(";");

  for (const part of parts) {

    const [key, ...value] =
      part.trim().split("=");

    if (key === name) {

      return decodeURIComponent(
        value.join("=")
      );

    }

  }

  return null;

}


export async function requireAdmin(req) {

  const token =
    getCookie(
      req,
      "admin_token"
    );


  if (!token) {

    throw new Error(
      "UNAUTHORIZED"
    );

  }


  try {

    const { payload } =
      await jwtVerify(
        token,
        getSecret()
      );


    if (
      payload.role !== "admin"
    ) {

      throw new Error(
        "UNAUTHORIZED"
      );

    }


    return payload;


  } catch {

    throw new Error(
      "UNAUTHORIZED"
    );

  }

}


export function unauthorized(res) {

  return res.status(401).json({

    success: false,

    error:
      "Unauthorized"

  });

}


/*
  Browser login check
*/

export default async function handler(
  req,
  res
) {

  try {

    const admin =
      await requireAdmin(req);


    return res.status(200).json({

      success: true,

      authenticated: true,

      username:
        admin.username || null

    });


  } catch {

    return res.status(401).json({

      success: false,

      authenticated: false

    });

  }

}
