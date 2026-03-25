export type RouteId =
  | "chat"
  | "memory"
  | "jobs"
  | "routines"
  | "extensions"
  | "skills";

type RouteDetails = {
  flagName:
    | "route_chat"
    | "route_memory"
    | "route_jobs"
    | "route_routines"
    | "route_extensions"
    | "route_skills";
  cardKeys: ["card-a", "card-b", "card-c"];
};

export const ROUTE_ORDER: RouteId[] = [
  "chat",
  "memory",
  "jobs",
  "routines",
  "extensions",
  "skills",
];

export const ROUTE_DETAILS: Record<RouteId, RouteDetails> = {
  chat: {
    flagName: "route_chat",
    cardKeys: ["card-a", "card-b", "card-c"],
  },
  memory: {
    flagName: "route_memory",
    cardKeys: ["card-a", "card-b", "card-c"],
  },
  jobs: {
    flagName: "route_jobs",
    cardKeys: ["card-a", "card-b", "card-c"],
  },
  routines: {
    flagName: "route_routines",
    cardKeys: ["card-a", "card-b", "card-c"],
  },
  extensions: {
    flagName: "route_extensions",
    cardKeys: ["card-a", "card-b", "card-c"],
  },
  skills: {
    flagName: "route_skills",
    cardKeys: ["card-a", "card-b", "card-c"],
  },
};
