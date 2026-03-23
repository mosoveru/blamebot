import { MatrixAuth } from "matrix-bot-sdk";

const homeserverURL = "https://matrix.interprocom.ru";

const auth = new MatrixAuth(homeserverURL);
const client = await auth.passwordLogin("axioma_notifier_bot", "FDeyX90wVx4F9UTO");

console.log("Access token of the bot: ", client.accessToken);
