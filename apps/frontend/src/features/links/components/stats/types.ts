import type { LinkStatsResponse } from "../../api/types";

export type LinkStatsEntity = LinkStatsResponse["linkStats"];
export type LinkDetails = LinkStatsEntity["link"];
export type LinkSeriesItem = LinkStatsEntity["series"][number];
