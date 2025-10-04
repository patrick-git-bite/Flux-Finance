
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp();

// Inicializa o gerenciador de CORS para permitir requisições do nosso site.
const corsHandler = cors({origin: true});

export const setUserRole = functions.https.onRequest((request, response) => {
  // O corsHandler envolve nossa função para lidar com as requisições
  // de "preflight" (OPTIONS) que o navegador envia antes do POST.
  corsHandler(request, response, async () => {
    functions.logger.info("Iniciando setUserRole (onRequest)", {
      body: request.body,
      headers: request.headers,
    });

    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      response.status(401).send({error: "Unauthorized"});
      return;
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      functions.logger.error("Erro ao verificar o token:", error);
      response.status(401).send({error: "Unauthorized"});
      return;
    }

    const {email, role} = request.body;
    const callerUid = decodedToken.uid;

    if (!email || !role) {
      response.status(400).send({error: "Missing email or role in body."});
      return;
    }

    try {
      const userToModify = await admin.auth().getUserByEmail(email);

      if (decodedToken.admin !== true) {
        if (callerUid !== userToModify.uid) {
          response.status(403).send({
            error: "Apenas administradores podem alterar outros usuários.",
          });
          return;
        }
      }

      let claims = {};
      if (role === "admin") {
        claims = {admin: true};
      }

      await admin.auth().setCustomUserClaims(userToModify.uid, claims);

      response.status(200).send({
        message: `Sucesso! ${email} agora tem o papel de ${role}.`,
      });
    } catch (error) {
      functions.logger.error("Erro ao definir o papel:", error);
      const err = error as { code?: string };
      if (err.code === "auth/user-not-found") {
        response.status(404).send({error: "User not found."});
      } else {
        response.status(500).send({error: "Internal server error."});
      }
    }
  });
});
