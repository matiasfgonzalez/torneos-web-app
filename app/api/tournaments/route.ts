// app/api/tournaments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Get logged in user
        const { userId } = await auth();

        // Check for user
        if (!userId) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 400 }
            );
        }

        // Get user from database
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
                description: body.description,
                category: body.category,
                locality: body.locality,
                startDate: new Date(body.startDate),
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                status: "PENDIENTE", // Estado inicial
                userId: user.id // Asociar torneo al usuario
            }
        });

        return NextResponse.json(newTournament, { status: 201 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Error al crear el torneo", { status: 500 });
    }
}
