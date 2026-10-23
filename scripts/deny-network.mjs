import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import http2 from "node:http2";
import { syncBuiltinESMExports } from "node:module";

const deny = () => {
  fs.appendFileSync(process.env.EVALGATE_NETWORK_ATTEMPTS, "blocked\n");
  throw new Error("Network access is denied during the local gate example");
};
globalThis.fetch = deny;
http.request = http.get = https.request = https.get = deny;
net.connect = net.createConnection = net.Socket.prototype.connect = deny;
http2.connect = deny;
syncBuiltinESMExports();
fs.appendFileSync(process.env.EVALGATE_NETWORK_GUARD_LOADED, "loaded\n");
