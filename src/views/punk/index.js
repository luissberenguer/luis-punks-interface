import {
  Stack,
  Heading,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Button,
  Tag,
  useToast,
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import RequestAccess from "../../components/request-access";
import PunkCard from "../../components/punk-card";
import { useLuisPunkData } from "../../hooks/useLuisPunksData";
import { useParams } from "react-router-dom";
import Loading from "../../components/loading";
import { useState } from "react";
import useLuisPunks from "../../hooks/useLuisPunks";

const Punk = () => {
  const { active, account, library } = useWeb3React();
  const { tokenId } = useParams();
  const { loading, punk, update } = useLuisPunkData(tokenId);
  const luisPunks = useLuisPunks();
  const toast = useToast();
  const [transfering, setTransfering] = useState(false);

  const transfer = () => {
    setTransfering(true);

    const address = prompt("Ingresa la dirección a la que queires transferir: ");

    const isAddress = library.utils.isAddress(address);

    if (!isAddress) {
      toast({
        title: "Dirección inválida",
        description: "La dirección no es una dirección de Ethereum",
        status: "error",
      });
      setTransfering(false);
    } else {
      luisPunks.methods
        .safeTransferFrom(punk.owner, address, punk.tokenId)
        .send({
          from: account,
        })
        .on("error", (error) => {
          setTransfering(false);
          toast({
            title: "Transferencia fallida",
            description: error.message,
            status: "error",
          });
        })
        .on("transactionHash", (txHash) => {
          toast({
            title: "Transacción enviada",
            description: txHash,
            status: "info",
          });
        })
        .on("receipt", () => {
          setTransfering(false);
          toast({
            title: "Transacción confirmada",
            description: `El punk ahora pertenece a ${address}`,
            status: "success",
          });
          update();
        });
    }
  };

  if (!active) return <RequestAccess />;

  if (loading) return <Loading />;

  return (
    <Stack
      spacing={{ base: 8, md: 10 }}
      py={{ base: 5 }}
      direction={{ base: "column", md: "row" }}
    >
      <Stack>
        <PunkCard
          mx={{
            base: "auto",
            md: 0,
          }}
          name={punk.name}
          image={punk.image}
        />
        <Button
          onClick={transfer}
          disabled={account !== punk.owner}
          colorScheme="green"
          isLoading={transfering}
        >
          {account !== punk.owner ? "No eres el dueño" : "Transferir"}
        </Button>
      </Stack>
      <Stack width="100%" spacing={5}>
        <Heading>{punk.name}</Heading>
        <Text fontSize="xl">{punk.description}</Text>
        <Text fontWeight={600}>
          DNA:
          <Tag ml={2} colorScheme="green">
            {punk.dna}
          </Tag>
        </Text>
        <Text fontWeight={600}>
          Owner:
          <Tag ml={2} colorScheme="green">
            {punk.owner}
          </Tag>
        </Text>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Atributo</Th>
              <Th>Valor</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(punk.attributes).map(([key, value]) => (
              <Tr key={key}>
                <Td>{key}</Td>
                <Td>
                  <Tag>{value}</Tag>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Stack>
    </Stack>
  );
};

export default Punk;
