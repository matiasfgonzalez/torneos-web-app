import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { checkUser } from "@/lib/checkUser";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  getMyPlayerCareer,
  getMyPlayerClaim,
} from "@modules/jugadores/actions/claims";
import MiFichaClient from "./MiFichaClient";

export const metadata: Metadata = {
  title: "Mi ficha | GOLAZO",
};

/**
 * El jugador y su ficha (N12).
 *
 * La ficha de jugador es global y la carga su club; acá el jugador la reclama
 * como propia para ver su trayectoria en todas las ligas y gestionar sus datos.
 */
export default async function MiFichaPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const claim = await getMyPlayerClaim();
  const career =
    claim?.status === "APROBADO" ? await getMyPlayerCareer(claim.playerId) : [];

  return (
    <div className="flex min-h-screen flex-col premium-gradient-bg">
      <Header isLogued />
      <main className="mx-auto w-full max-w-3xl flex-grow px-4 py-10">
        <MiFichaClient
          claim={
            claim
              ? {
                  status: claim.status,
                  player: {
                    name: claim.player.name,
                    nationalId: claim.player.nationalId,
                    position: claim.player.position,
                    imageUrlFace: claim.player.imageUrlFace,
                  },
                }
              : null
          }
          career={career}
        />
      </main>
      <Footer />
    </div>
  );
}
