import type { JourneyDetails } from "../types";

const MOCK_JOURNEYS: Record<string, JourneyDetails> = {
  "1234567890": {
    pnr: "1234567890",
    trainName: "Express Voyager",
    trainNumber: "12021",
    coach: "B3",
    departure: "City A",
    arrival: "City B",
    departureTime: "08:30",
    arrivalTime: "16:45",
  },
  "0987654321": {
    pnr: "0987654321",
    trainName: "Express Voyager",
    trainNumber: "12021",
    coach: "B3",
    departure: "City A",
    arrival: "City M",
    departureTime: "08:30",
    arrivalTime: "16:45",
  },
  "1122334455": {
    pnr: "1122334455",
    trainName: "Express Voyager",
    trainNumber: "12021",
    coach: "B3",
    departure: "City A",
    arrival: "City M",
    departureTime: "08:30",
    arrivalTime: "16:45",
  },
};

export const verifyPnr = (pnr: string): Promise<JourneyDetails> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const journey = MOCK_JOURNEYS[pnr];
      if (journey) {
        resolve(journey);
      } else {
        reject(new Error("Invalid PNR. Please use one of the demo PNRs."));
      }
    }, 1500); // Simulate network delay
  });
};
