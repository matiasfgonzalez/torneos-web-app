// app/api/tournaments/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 400 }
            );
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });

        // Check if user exists
        if (!user) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        const newTournament = await db.tournament.create({
            data: {
                name: body.name,
                description: body.description || null,
                category: body.category,
                locality: body.locality,
                startDate: new Date(body.startDate),
                endDate: body.endDate ? new Date(body.endDate) : null,
                format: body.format,
                homeAndAway: body.homeAndAway ?? false,
                logoUrl: body.logoUrl || null,
                liga: body.liga || null,
                nextMatch: body.nextMatch ? new Date(body.nextMatch) : null,
                status: "PENDIENTE",
                userId: user.id
            }
        });

        return NextResponse.json(newTournament, { status: 201 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Error al crear el torneo", { status: 500 });
    }
}
