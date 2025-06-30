// app/api/test-db/route.js
import dbConnect from "@/lib/dbConnect";

export async function GET(request) {
  try {
    await dbConnect();
    return new Response(JSON.stringify({ message: "Database connected successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Database connection failed", details: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
