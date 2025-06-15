
import { historyService } from "./stageHistory/historyService";
import { passThroughService } from "./stageHistory/passThroughService";
import { velocityService } from "./stageHistory/velocityService";

export const stageHistoryAPI = {
  ...historyService,
  ...passThroughService,
  ...velocityService
};
