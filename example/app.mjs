#!/usr/bin/env node


import {FluxEcoNodeHttpServer} from "../../../../../flux-eco-node-http-server/FluxEcoNodeHttpServer.mjs";
import fs from "node:fs";

const httpServerConfigBuffer = fs.readFileSync("./definitions/file-paths.json", 'utf-8');
const object = JSON.parse(httpServerConfigBuffer.toString());

const fluxEcoNodeHttpServer = await FluxEcoNodeHttpServer.new(
     {
         settings:{
             host: "localhost",
             port: 3100
         },
        schemas: {
            filePathsSchema: object
        }
    },{}
);
fluxEcoNodeHttpServer.start();