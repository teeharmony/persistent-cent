import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await dbConnect();

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return NextResponse.json({ message: "Subscription reactivated" });
      }
      return NextResponse.json({ message: "Already subscribed" });
    }

    await Subscriber.create({ email: email.toLowerCase() });

    return NextResponse.json(
      { message: "Successfully subscribed" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
