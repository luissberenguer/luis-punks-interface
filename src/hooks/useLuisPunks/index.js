import { useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import LuisPunksArtifact from "../../config/web3/artifacts/LuisPunks";

const { address, abi } = LuisPunksArtifact;

const useLuisPunks = () => {
  const { active, library, chainId } = useWeb3React();

  const luisPunks = useMemo(() => {
    if (active) return new library.eth.Contract(abi, address[chainId]);
  }, [active, chainId, library?.eth?.Contract]);

  return luisPunks;
};

export default useLuisPunks;
