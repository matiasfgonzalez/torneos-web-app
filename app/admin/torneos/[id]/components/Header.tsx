import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ITorneo } from "@/components/torneos/types";
import DialogAddTournaments from "../../components/DialogAddTournaments";
import { DeleteTournamentButton } from "../../components/DeleteTournamentButton";

interface PropsHeader {
  tournamentData: ITorneo;
}

const Header = (props: PropsHeader) => {
  const { tournamentData } = props;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/admin/torneos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex items-center space-x-3">
          <img
            src={
              tournamentData.logoUrl ||
              "/placeholder.svg?height=48&width=48&query=torneo-logo"
            }
            alt={`Logo ${tournamentData.name}`}
            className="w-13 h-13 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {tournamentData.name}
            </h1>
            <p className="text-muted-foreground">
              {tournamentData.category} • {tournamentData.locality}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <DialogAddTournaments tournament={tournamentData} />
        <DeleteTournamentButton tournament={tournamentData} />
      </div>
    </div>
  );
};

export default Header;
