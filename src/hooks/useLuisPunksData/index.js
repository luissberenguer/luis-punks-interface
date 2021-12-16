import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import useLuisPunks from "../useLuisPunks";

const getPunkData = async ({ luisPunks, tokenId }) => {
  const [
    tokenURI,
    dna,
    owner,
    accessoriesType,
    clotheColor,
    clotheType,
    eyeType,
    eyeBrowType,
    facialHairColor,
    facialHairType,
    hairColor,
    hatColor,
    graphicType,
    mouthType,
    skinColor,
    topType,
  ] = await Promise.all([
    luisPunks.methods.tokenURI(tokenId).call(),
    luisPunks.methods.tokenDNA(tokenId).call(),
    luisPunks.methods.ownerOf(tokenId).call(),
    luisPunks.methods.getAccessoriesType(tokenId).call(),
    luisPunks.methods.getAccessoriesType(tokenId).call(),
    luisPunks.methods.getClotheColor(tokenId).call(),
    luisPunks.methods.getClotheType(tokenId).call(),
    luisPunks.methods.getEyeType(tokenId).call(),
    luisPunks.methods.getEyeBrowType(tokenId).call(),
    luisPunks.methods.getFacialHairColor(tokenId).call(),
    luisPunks.methods.getFacialHairType(tokenId).call(),
    luisPunks.methods.getHairColor(tokenId).call(),
    luisPunks.methods.getHatColor(tokenId).call(),
    luisPunks.methods.getGraphicType(tokenId).call(),
    luisPunks.methods.getMouthType(tokenId).call(),
    luisPunks.methods.getSkinColor(tokenId).call(),
    luisPunks.methods.getTopType(tokenId).call(),
  ]);

  const responseMetadata = await fetch(tokenURI);
  const metadata = await responseMetadata.json();

  return {
    tokenId,
    attributes: {
      accessoriesType,
      clotheColor,
      clotheType,
      eyeType,
      eyeBrowType,
      facialHairColor,
      facialHairType,
      hairColor,
      hatColor,
      graphicType,
      mouthType,
      skinColor,
      topType,
    },
    tokenURI,
    dna,
    owner,
    ...metadata,
  };
};

// Plural
const useLuisPunksData = ({ owner = null } = {}) => {
  const [punks, setPunks] = useState([]);
  const { library } = useWeb3React();
  const [loading, setLoading] = useState(true);
  const luisPunks = useLuisPunks();

  const update = useCallback(async () => {
    if (luisPunks) {
      setLoading(true);

      let tokenIds;

      if (!library.utils.isAddress(owner)) {
        const totalSupply = await luisPunks.methods.totalSupply().call();
        tokenIds = new Array(Number(totalSupply))
          .fill()
          .map((_, index) => index);
      } else {
        const balanceOf = await luisPunks.methods.balanceOf(owner).call();

        const tokenIdsOfOwner = new Array(Number(balanceOf))
          .fill()
          .map((_, index) =>
            luisPunks.methods.tokenOfOwnerByIndex(owner, index).call()
          );

        tokenIds = await Promise.all(tokenIdsOfOwner);
      }

      const punksPromise = tokenIds.map((tokenId) =>
        getPunkData({ tokenId, luisPunks })
      );

      const punks = await Promise.all(punksPromise);

      setPunks(punks);
      setLoading(false);
    }
  }, [luisPunks, owner, library?.utils]);

  useEffect(() => {
    update();
  }, [update]);

  return {
    loading,
    punks,
    update,
  };
};

// Singular
const useLuisPunkData = (tokenId = null) => {
  const [punk, setPunk] = useState({});
  const [loading, setLoading] = useState(true);
  const luisPunks = useLuisPunks();

  const update = useCallback(async () => {
    if (luisPunks && tokenId != null) {
      setLoading(true);

      const toSet = await getPunkData({ tokenId, luisPunks });
      setPunk(toSet);

      setLoading(false);
    }
  }, [luisPunks, tokenId]);

  useEffect(() => {
    update();
  }, [update]);

  return {
    loading,
    punk,
    update,
  };
};

export { useLuisPunksData, useLuisPunkData };
