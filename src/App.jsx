import React, { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Button,
  Text,
  VStack,
  Spinner,
  Center,
  IconButton,
  Icon,
  HStack,
  Circle,
  useToast,
  Image,
} from "@chakra-ui/react";
import { AddIcon, CheckCircleIcon, CloseIcon } from "@chakra-ui/icons";
import { keyframes } from "@emotion/react";

const CLIENTS = {
  "OK Foods": {
    boardId: 8580538177,
    fileColumnId: "files",
  },
  Usave: {
    boardId: 4918008751,
    subitemBoardId: 4918009127,
    fileColumnId: "files3",
    subitemFileColumnId: "files_mkmmyqrw",
  },
  BP: {
    boardId: 2040145285,
    subitemBoardId: 3609338894,
    fileColumnId: "files__1",
    subitemFileColumnId: "file_mksrwj2t",
  },
  Goldwagen: {
    boardId: 8580549417,
    subitemBoardId: 8580549442,
    fileColumnId: "files__1",
    subitemFileColumnId: "file_mksrdsz6",
  },
  "Sportsmans Warehouse": {
    boardId: 2040227054,
    subitemBoardId: 2040227074,
    fileColumnId: "file_mks9j2ag",
    subitemFileColumnId: "file_mksrxkj4",
  },
  Petworld: {
    boardId: 2035898218,
    subitemBoardId: 2035898237,
    fileColumnId: "file_mksqt1xb",
    subitemFileColumnId: "file_mksrv1m2",
  },
  Britos: {
    boardId: 2040213584,
    subitemBoardId: 2040213604,
    fileColumnId: "file_mkp4c3bp",
    subitemFileColumnId: "file_mksr793n",
  },
  "V&A Waterfront": {
    boardId: 8589977804,
    subitemBoardId: 8589977828,
    fileColumnId: "files",
    subitemFileColumnId: "file_mksrwj5e",
  },
  PNA: {
    boardId: 4858437792,
    subitemBoardId: 4858437810,
    fileColumnId: "files",
    subitemFileColumnId: "file_mksr3qby",
  },
  "PnP Clothing": {
    boardId: 8165706664,
    subitemBoardId: 9479333157,
    fileColumnId: "file_mknqx8v5",
    subitemFileColumnId: "file_mksrgsyt",
  },
};

const BACKEND_URL = "https://monday-file-backend.onrender.com";

const FloatingLabelInput = ({ label, value, onChange, type = "text", ...props }) => {
  const isActive = !!value;

  return (
    <FormControl position="relative" mt={4}>
      <Input
        value={value}
        onChange={onChange}
        type={type}
        placeholder=" "
        focusBorderColor="blue.400"
        {...props}
      />
      <FormLabel
        position="absolute"
        top={isActive ? "-1.5rem" : "50%"}
        left="0.75rem"
        fontSize={isActive ? "sm" : "md"}
        color={isActive ? "blue.600" : "gray.500"}
        transform={isActive ? "none" : "translateY(-50%)"}
        transition="all 0.2s ease"
        pointerEvents="none"
        bg="white"
        px={1}
      >
        {label}
      </FormLabel>
    </FormControl>
  );
};

const FloatingLabelSelect = ({ label, value, onChange, children, ...props }) => {
  const isActive = !!value;

  return (
    <FormControl position="relative" mt={4}>
      <Select
        value={value}
        onChange={onChange}
        placeholder=" "
        focusBorderColor="blue.400"
        {...props}
      >
        {children}
      </Select>
      <FormLabel
        position="absolute"
        top={isActive ? "-1.5rem" : "50%"}
        left="0.75rem"
        fontSize={isActive ? "sm" : "md"}
        color={isActive ? "blue.600" : "gray.500"}
        transform={isActive ? "none" : "translateY(-50%)"}
        transition="all 0.2s ease"
        pointerEvents="none"
        bg="white"
        px={1}
      >
        {label}
      </FormLabel>
    </FormControl>
  );
};

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0px rgba(66, 153, 225, 0.6);
  }
  50% {
    box-shadow: 0 0 15px rgba(66, 153, 225, 0.9);
  }
  100% {
    box-shadow: 0 0 0px rgba(66, 153, 225, 0.6);
  }
`;

const confetti = keyframes`
  0% {opacity: 0; transform: translateY(0) rotate(0deg);}
  50% {opacity: 1; transform: translateY(-15px) rotate(15deg);}
  100% {opacity: 0; transform: translateY(0) rotate(0deg);}
`;

export default function InstallForm() {
  const [formData, setFormData] = useState({
    client: "",
    storeName: "",
    screens: [],
    subitemsWanted: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stepper states
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  async function uploadFileToBackend(file, client, itemId, columnId) {
    const fd = new FormData();
    fd.append("file", file);
    const url = new URL(`${BACKEND_URL}/upload`);
    url.searchParams.append("item_id", itemId);
    url.searchParams.append("column_id", columnId);

    const response = await fetch(url.toString(), {
      method: "POST",
      body: fd,
    });

    if (!response.ok) throw new Error("File upload failed");
    const result = await response.json();
    if (!result.data?.add_file_to_column) throw new Error("File upload failed");

    return result.data.add_file_to_column.id;
  }

  async function createMainItem(boardId, itemName) {
    const response = await fetch(`${BACKEND_URL}/create-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, itemName }),
    });

    if (!response.ok) throw new Error("Create main item failed");
    const result = await response.json();
    return result.data.create_item.id;
  }

  async function createSubitem(parentItemId, itemName) {
    const response = await fetch(`${BACKEND_URL}/create-subitem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentItemId, itemName }),
    });

    if (!response.ok) throw new Error("Create subitem failed");
    const result = await response.json();
    return result.data.create_subitem.id;
  }

  async function submitToBackend(data) {
    setLoading(true);
    setError(null);
    try {
      if (!data.client || !(data.client in CLIENTS))
        throw new Error("Invalid client selected.");

      const clientInfo = CLIENTS[data.client];
      const boardId = clientInfo.boardId;
      const mainItemId = await createMainItem(boardId, data.storeName);

      if (!data.subitemsWanted && data.screens.length > 0) {
        const uploads = [];
        if (data.screens[0].serialPic) {
          uploads.push(uploadFileToBackend(data.screens[0].serialPic, data.client, mainItemId, clientInfo.fileColumnId));
        }
        if (data.screens[0].boxPic) {
          uploads.push(uploadFileToBackend(data.screens[0].boxPic, data.client, mainItemId, clientInfo.fileColumnId));
        }
        await Promise.all(uploads);
      }

      if (data.subitemsWanted) {
        for (const screen of data.screens) {
          const subitemId = await createSubitem(mainItemId, screen.name || "Unnamed Screen");
          let columnId = clientInfo.subitemFileColumnId || clientInfo.fileColumnId;

          const uploads = [];
          if (screen.serialPic) uploads.push(uploadFileToBackend(screen.serialPic, data.client, subitemId, columnId));
          if (screen.boxPic) uploads.push(uploadFileToBackend(screen.boxPic, data.client, subitemId, columnId));
          await Promise.all(uploads);
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitToBackend(formData);
  };

  const ConfettiDot = ({ left, delay, color }) => (
    <Box
      position="absolute"
      bottom="0"
      left={left}
      w="8px"
      h="8px"
      rounded="full"
      bg={color}
      animation={`${confetti} 2s ease-in-out infinite`}
      animationDelay={delay}
      opacity={0}
      zIndex={10}
    />
  );

  // Stepper UI component
  const Stepper = () => (
    <Box mb={8}>
      <HStack justify="center" spacing={6}>
        {[...Array(totalSteps)].map((_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === step;
          const isCompleted = stepNum < step;
          return (
            <Circle
              key={stepNum}
              size="30px"
              bg={isCompleted ? "blue.400" : isActive ? "blue.600" : "gray.300"}
              color="white"
              fontWeight="bold"
              cursor="pointer"
              onClick={() => setStep(stepNum)}
              userSelect="none"
            >
              {stepNum}
            </Circle>
          );
        })}
      </HStack>
    </Box>
  );

  if (submitted) {
    return (
      <Center
        minH="100vh"
        bgGradient="linear(to-bl, #f8601d, #f2bb39)"
        flexDir="column"
        p={6}
        position="relative"
      >
        <Box
          bg="white"
          p={10}
          rounded="3xl"
          maxW="500px"
          w="100%"
          textAlign="center"
          boxShadow="2xl"
        >
          <Icon as={CheckCircleIcon} boxSize={24} color="green.500" mb={6} />
          <Heading size="2xl" color="green.600" fontWeight="extrabold" mb={4}>
            Installation Submitted!
          </Heading>
          <Text fontSize="lg" color="gray.700" mb={6}>
            Thanks for your submission. We've received all installation details and images.
          </Text>
          <Button
            colorScheme="green"
            onClick={() => {
              setSubmitted(false);
              setFormData({
                client: "",
                storeName: "",
                screens: [],
                subitemsWanted: false,
              });
              setStep(1);
            }}
          >
            Submit Another
          </Button>
          <ConfettiDot left="10%" delay="0s" color="red.400" />
          <ConfettiDot left="30%" delay="0.4s" color="blue.400" />
          <ConfettiDot left="50%" delay="0.8s" color="purple.400" />
          <ConfettiDot left="70%" delay="1.2s" color="orange.400" />
        </Box>
      </Center>
    );
  }

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-bl, #f8601d, #f2bb39)"
      p={6}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        bg="white"
        p={10}
        rounded="3xl"
        maxW="650px"
        w="100%"
        boxShadow="2xl"
        position="relative"
        textAlign="center"
      >
        <Image
          src="/board-drop-ops.png"
          alt="Logo"
          mx={-5}
          mb={-10}
          mt={-10}
          maxW="275"
        />

        {/* Stepper placed here */}
        <Stepper />

        {error && <Text color="red.500" mb={4}>{error}</Text>}

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">

            {/* Step 1: Client & Store Name */}
            {step === 1 && (
              <>
                <FloatingLabelSelect
                  label="Client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                >
                  {Object.keys(CLIENTS).map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </FloatingLabelSelect>

                <FloatingLabelInput
                  label="Store Name"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                />

                <Checkbox
                  isChecked={formData.subitemsWanted}
                  onChange={(e) =>
                    setFormData({ ...formData, subitemsWanted: e.target.checked, screens: [] })
                  }
                >
                  Subitems wanted
                </Checkbox>
              </>
            )}

            {/* Step 2: Screens Input */}
            {step === 2 && (
              <>
                {formData.subitemsWanted ? (
                  <>
                    {formData.screens.map((screen, idx) => (
                      <Box
                        key={idx}
                        p={4}
                        rounded="lg"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.200"
                        position="relative"
                      >
                        <IconButton
                          icon={<CloseIcon />}
                          aria-label="Remove Screen"
                          size="md"
                          colorScheme="red"
                          variant="outline"
                          position="absolute"
                          top={-5}
                          right={-5}
                          zIndex={20}
                          borderRadius="full"
                          boxShadow="md"
                          _hover={{ bg: "red.100" }}
                          _active={{ bg: "red.200" }}
                          onClick={() => {
                            const updated = [...formData.screens];
                            updated.splice(idx, 1);
                            setFormData({ ...formData, screens: updated });
                          }}
                        />

                        <FormControl mb={2}>
                          <Input
                            placeholder="Screen Name"
                            value={screen.name}
                            onChange={(e) => {
                              const screens = [...formData.screens];
                              screens[idx].name = e.target.value;
                              setFormData({ ...formData, screens });
                            }}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Serial Number Photo</FormLabel>
                          <Input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => {
                              const screens = [...formData.screens];
                              screens[idx].serialPic = e.target.files[0];
                              setFormData({ ...formData, screens });
                            }}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Box Photo</FormLabel>
                          <Input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => {
                              const screens = [...formData.screens];
                              screens[idx].boxPic = e.target.files[0];
                              setFormData({ ...formData, screens });
                            }}
                          />
                        </FormControl>
                      </Box>
                    ))}

                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      variant="solid"
                      bg="#4ea3e4"
                      _hover={{ bg: "#3182ce" }}
                      animation={`${pulseGlow} 2s infinite`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          screens: [...formData.screens, { name: "", serialPic: null, boxPic: null }],
                        })
                      }
                    >
                      Add Screen
                    </Button>
                  </>
                ) : (
                  <>
                    <FormControl isRequired>
                      <FormLabel>Serial Number Photo</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            screens: [
                              {
                                name: formData.storeName,
                                serialPic: e.target.files[0],
                                boxPic: formData.screens[0]?.boxPic || null,
                              },
                            ],
                          })
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Box Photo</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            screens: [
                              {
                                name: formData.storeName,
                                serialPic: formData.screens[0]?.serialPic || null,
                                boxPic: e.target.files[0],
                              },
                            ],
                          })
                        }
                      />
                    </FormControl>
                  </>
                )}
              </>
            )}

            {/* Step 3: Submit Button */}
            {step === 3 && (
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                bg="#4ea3e4"
                _hover={{ bg: "#3182ce" }}
                isLoading={loading}
                loadingText="Submitting"
                animation={`${pulseGlow} 2s infinite`}
              >
                Submit
              </Button>
            )}

            {/* Navigation Buttons */}
            <HStack justify="space-between" mt={6}>

              <Button
                onClick={() => setStep(step - 1)}
                isDisabled={step === 1}
                variant="outline"
                colorScheme="blue"
              >
                Back
              </Button>

              {step < totalSteps && (
                <Button
                  onClick={() => setStep(step + 1)}
                  colorScheme="blue"
                  isDisabled={
                    (step === 1 && (!formData.client || !formData.storeName)) ||
                    (step === 2 && formData.subitemsWanted && formData.screens.length === 0)
                  }
                >
                  Next
                </Button>
              )}

            </HStack>

          </VStack>
        </form>

        {loading && (
          <Box
            position="absolute"
            inset={0}
            bg="blackAlpha.600"
            display="flex"
            justifyContent="center"
            alignItems="center"
            rounded="3xl"
            zIndex={10}
          >
            <Spinner size="xl" color="white" />
          </Box>
        )}
      </Box>
    </Box>
  );
}
