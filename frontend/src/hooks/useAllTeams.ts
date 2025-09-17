import React, { useEffect, useState } from "react";
import { teamService } from "@/services/teamService";
import { Team } from "@/types/team";

const useAllTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const getAllTeams = async () => {
    const teams = await teamService.getAllTeams();
    setTeams(teams);
  };
  useEffect(() => {
    getAllTeams();
  }, []);
  return teams;
};

export default useAllTeams;
