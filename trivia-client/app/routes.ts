import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("sala", "routes/sala.tsx"),
    route("juego", "routes/juego.tsx"),
] satisfies RouteConfig;
