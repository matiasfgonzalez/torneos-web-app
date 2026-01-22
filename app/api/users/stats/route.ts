import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Obtener estadísticas generales
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      pendingUsers,
      adminCount,
      moderatorCount,
      editorCount,
      organizerCount,
      userCount,
    ] = await Promise.all([
      // Total de usuarios
      db.user.count({
        where: { isActive: true },
      }),
      // Usuarios activos
      db.user.count({
        where: {
          isActive: true,
          status: UserStatus.ACTIVE,
        },
      }),
      // Usuarios inactivos
      db.user.count({
        where: {
          isActive: true,
          status: UserStatus.INACTIVE,
        },
      }),
      // Usuarios suspendidos
      db.user.count({
        where: {
          isActive: true,
          status: UserStatus.SUSPENDED,
        },
      }),
      // Usuarios pendientes
      db.user.count({
        where: {
          isActive: true,
          status: UserStatus.PENDING,
        },
      }),
      // Conteo por roles
      db.user.count({
        where: {
          isActive: true,
          role: UserRole.ADMIN,
        },
      }),
      db.user.count({
        where: {
          isActive: true,
          role: UserRole.MODERATOR,
        },
      }),
      db.user.count({
        where: {
          isActive: true,
          role: UserRole.EDITOR,
        },
      }),
      db.user.count({
        where: {
          isActive: true,
          role: UserRole.ORGANIZER,
        },
      }),
      db.user.count({
        where: {
          isActive: true,
          role: UserRole.USER,
        },
      }),
    ]);

    // Obtener usuarios registrados en los últimos períodos
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [usersLast30Days, usersLast7Days, usersLast24Hours, recentLogins] =
      await Promise.all([
        db.user.count({
          where: {
            isActive: true,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        db.user.count({
          where: {
            isActive: true,
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        db.user.count({
          where: {
            isActive: true,
            createdAt: { gte: oneDayAgo },
          },
        }),
        db.user.count({
          where: {
            isActive: true,
            lastLoginAt: { gte: sevenDaysAgo },
          },
        }),
      ]);

    // Obtener estadísticas de actividad
    const [totalNews, totalTournaments, totalTeams, emailVerifiedCount] =
      await Promise.all([
        db.news.count(),
        db.tournament.count(),
        db.team.count(),
        db.user.count({
          where: {
            isActive: true,
            emailVerified: true,
          },
        }),
      ]);

    // Obtener distribución por fechas de registro (últimos 12 meses)
    const monthsAgo = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      };
    }).reverse();

    const registrationsByMonth = await Promise.all(
      monthsAgo.map(async ({ month, year, start, end }) => {
        const count = await db.user.count({
          where: {
            isActive: true,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });

        return {
          month: month + 1,
          year,
          count,
          label: new Intl.DateTimeFormat("es-ES", {
            month: "short",
            year: "numeric",
          }).format(start),
        };
      })
    );

    // Construir respuesta
    const stats = {
      overview: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
        pending: pendingUsers,
        emailVerified: emailVerifiedCount,
        recentLogins: recentLogins,
      },
      roleDistribution: {
        admin: adminCount,
        moderator: moderatorCount,
        editor: editorCount,
        organizer: organizerCount,
        user: userCount,
      },
      statusDistribution: {
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
        pending: pendingUsers,
      },
      growth: {
        last24Hours: usersLast24Hours,
        last7Days: usersLast7Days,
        last30Days: usersLast30Days,
        byMonth: registrationsByMonth,
      },
      activity: {
        totalNews,
        totalTournaments,
        totalTeams,
        averageContentPerUser:
          totalUsers > 0
            ? Math.round(
                ((totalNews + totalTournaments + totalTeams) / totalUsers) * 100
              ) / 100
            : 0,
      },
      percentages: {
        activeUsers:
          totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
        emailVerified:
          totalUsers > 0
            ? Math.round((emailVerifiedCount / totalUsers) * 100)
            : 0,
        recentActivity:
          totalUsers > 0 ? Math.round((recentLogins / totalUsers) * 100) : 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: "No se pudieron obtener las estadísticas de usuarios",
      },
      { status: 500 }
    );
  }
}

