import { Container } from "inversify";
import Types from "./types";
import { Server } from "./server";
import { Application } from "./app";
import { Index } from "./routes/index";
import { Routes } from "./routes";
import { EmptyGrid } from "./mot-croise/emptyGrid";

import { RoutePiste } from "./routes/route-piste";

const container: Container = new Container();

container.bind(Types.Server).to(Server);
container.bind(Types.Application).to(Application);
container.bind(Types.Routes).to(Routes);
container.bind(Types.Index).to(Index);
container.bind(Types.EmptyGrid).to(EmptyGrid);
container.bind(Types.RoutePiste).to(RoutePiste);

export { container };
