/** @jsx h */
import { Handlers } from "$fresh/server.ts";
import * as queryString from "query-string";
import {
  getUserInfo,
  getAccessToken,
  getClient,
} from "../../src/github.ts";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

const getCode = (url: URL): E.Either<unknown, string> => {
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error");
  return !code || err ? E.left(err) : E.right(code);
};

export const handler: Handlers<unknown> = {
  async GET(req, ctx) {
    const client = pipe(
      getClient(),
      O.map(TE.right),
      O.getOrElse(() => TE.left("no client" as unknown))
    );

    const code = pipe(
      new URL(req.url),
      getCode,
      E.map(TE.right),
      E.getOrElse(() => TE.left("no code" as unknown))
    );

    return await pipe(
      client,
      TE.chainTaskK(client => pipe(
        TE.Do,
        TE.bind("code", () => code),
        TE.map((e) => e),
        TE.bind("token", ({ code }) => getAccessToken(client, code)),
        TE.bind("user", ({ token }) => getUserInfo(token)),
        TE.map(() => client.redirectSuccess),
        TE.mapLeft(
          (e) =>
            `${client.redirectError}?${queryString.stringify({
              err: JSON.stringify(e),
            })}`
        ),
        TE.toUnion
      )),
      TE.map(url => Response.redirect(url)),
      TE.mapLeft(() => Response.error()),
      TE.toUnion
    )();
  },
};
