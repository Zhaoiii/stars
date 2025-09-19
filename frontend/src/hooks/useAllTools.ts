import React, { useEffect, useState } from "react";
import { EvaluationAPI } from "@/services/evaluationService";
import { EvaluationToolNodeDTO } from "@/types/evaluation";

const useAllTools = () => {
  const [tools, setTools] = useState<EvaluationToolNodeDTO[]>([]);
  const getAllTeams = async () => {
    const res = await EvaluationAPI.getTools();
    setTools(res.data?.data || []);
  };
  useEffect(() => {
    getAllTeams();
  }, []);
  return tools;
};

export default useAllTools;
