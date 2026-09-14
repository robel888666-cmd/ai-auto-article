import { SignJWT } from "jose";

function getSecret() {

  return new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET
  );

}

export default async function handler(
  req,
  res
) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }

  try {

    const {
      username,
      password
    } = req.body || {};

    if (
      username !==
        process.env.ADMIN_USERNAME ||
      password !==
        process.env.ADMIN_PASSWORD
    ) {

      return res.status(401).json({
        error:
          "Invalid username or password"
      });

    }

    const token =
      await new SignJWT({
        role: "admin",
        username
      })
      .setProtectedHeader({
        alg: "HS256"
      })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getSecret());

    res.setHeader(
      "Set-Cookie",

      `admin_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    );

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
